import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { untypedTable } from "@/integrations/supabase/untyped-client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";
import { format } from "date-fns";

interface Journey {
  id: string;
  started_at: string;
  is_active: boolean;
  jokers_remaining: number;
  current_streak: number;
  longest_streak: number;
  last_check_in: string | null;
  status: string;
}

interface CheckIn {
  id: string;
  checkin_date: string;
  status: "success" | "failed";
}

export function useRecoveryJourney() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [journey, setJourney] = useState<Journey | null>(null);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [declined, setDeclined] = useState(false);

  const today = format(new Date(), "yyyy-MM-dd");
  const hasCheckedInToday = journey?.last_check_in === today;

  useEffect(() => {
    if (user) {
      fetchJourney();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchJourney = async () => {
    if (!user) return;

    try {
      const { data: journeyData, error: journeyError } = await supabase
        .from("recovery_journey")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle();

      if (journeyError) throw journeyError;

      if (journeyData) {
        setJourney(journeyData as unknown as Journey);

        const { data: checkInsData, error: checkInsError } = await supabase
          .from("recovery_checkins")
          .select("*")
          .eq("journey_id", journeyData.id)
          .order("checkin_date", { ascending: false });

        if (checkInsError) throw checkInsError;
        setCheckIns((checkInsData as CheckIn[]) || []);
      }
    } catch (error) {
      console.error("Error fetching recovery journey:", error);
    } finally {
      setLoading(false);
    }
  };

  const startJourney = async () => {
    if (!user) return;

    try {
      const { data, error } = await untypedTable("recovery_journey")
        .insert({
          user_id: user.id,
          jokers_remaining: 3,
          current_streak: 0,
          longest_streak: 0,
          status: "active",
        })
        .select()
        .single();

      if (error) throw error;

      setJourney(data as unknown as Journey);
      setCheckIns([]);
      toast({
        title: "Challenge Started",
        description: "Your recovery journey has begun. Good luck!",
      });
    } catch (error) {
      console.error("Error starting journey:", error);
      toast({
        title: "Error",
        description: "Failed to start the challenge. Please try again.",
        variant: "destructive",
      });
    }
  };

  const declineJourney = () => {
    setDeclined(true);
  };

  const checkIn = async (status: "success" | "failed") => {
    if (!user || !journey || hasCheckedInToday) return;

    try {
      // Insert check-in record
      const { data, error } = await supabase
        .from("recovery_checkins")
        .insert({
          user_id: user.id,
          journey_id: journey.id,
          status,
          checkin_date: today,
        })
        .select()
        .single();

      if (error) throw error;

      // Update journey based on status
      if (status === "success") {
        const newStreak = journey.current_streak + 1;
        const newLongest = Math.max(newStreak, journey.longest_streak);

        await untypedTable("recovery_journey")
          .update({
            current_streak: newStreak,
            longest_streak: newLongest,
            last_check_in: today,
          })
          .eq("id", journey.id);

        setJourney(prev => prev ? {
          ...prev,
          current_streak: newStreak,
          longest_streak: newLongest,
          last_check_in: today,
        } : null);

        toast({
          title: "Great job! 🔥",
          description: `Day ${newStreak} done. Keep going!`,
        });
      } else {
        // Failed - consume a joker, DON'T advance the day
        const newJokers = Math.max(0, journey.jokers_remaining - 1);
        const updates: Record<string, any> = {
          jokers_remaining: newJokers,
          last_check_in: today,
        };

        if (newJokers <= 0) {
          updates.status = "paused";
        }

        await untypedTable("recovery_journey")
          .update(updates)
          .eq("id", journey.id);

        setJourney(prev => prev ? { ...prev, ...updates } : null);

        if (newJokers <= 0) {
          toast({
            title: "Challenge paused",
            description: "No jokers remaining. Resume or reset to continue.",
          });
        } else {
          toast({
            title: "Stay strong",
            description: `Joker used (${newJokers} remaining). The day doesn't advance — you'll retry.`,
          });
        }
      }

      setCheckIns(prev => [data as CheckIn, ...prev]);
    } catch (error) {
      console.error("Error checking in:", error);
      toast({
        title: "Error",
        description: "Failed to record check-in. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resetJourney = async () => {
    if (!user || !journey) return;

    try {
      // Deactivate current journey
      await supabase
        .from("recovery_journey")
        .update({ is_active: false })
        .eq("id", journey.id);

      // Start new journey
      await startJourney();
    } catch (error) {
      console.error("Error resetting journey:", error);
      toast({
        title: "Error",
        description: "Failed to reset. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resumeJourney = async () => {
    if (!user || !journey) return;

    try {
      await untypedTable("recovery_journey")
        .update({ status: "active" })
        .eq("id", journey.id);

      setJourney(prev => prev ? { ...prev, status: "active" } : null);

      toast({
        title: "Challenge resumed",
        description: journey.jokers_remaining > 0
          ? "Let's keep going!"
          : "No jokers left — any setback will pause again.",
      });
    } catch (error) {
      console.error("Error resuming journey:", error);
      toast({
        title: "Error",
        description: "Failed to resume. Please try again.",
        variant: "destructive",
      });
    }
  };

  const abandonJourney = async () => {
    if (!user || !journey) return;

    try {
      await supabase
        .from("recovery_journey")
        .update({ is_active: false })
        .eq("id", journey.id);

      setJourney(null);
      setCheckIns([]);
      toast({
        title: "Challenge Abandoned",
        description: "You can start again anytime you're ready.",
      });
    } catch (error) {
      console.error("Error abandoning journey:", error);
      toast({
        title: "Error",
        description: "Failed to abandon challenge. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    journey,
    checkIns,
    loading,
    declined,
    hasCheckedInToday,
    startJourney,
    declineJourney,
    checkIn,
    resetJourney,
    resumeJourney,
    abandonJourney,
  };
}
