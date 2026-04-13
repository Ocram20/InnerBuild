import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { untypedTable } from "@/integrations/supabase/untyped-client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
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
        title: t("recovery.toast_started_title"),
        description: t("recovery.toast_started_desc"),
      });
    } catch (error) {
      console.error("Error starting journey:", error);
      toast({
        title: t("recovery.toast_start_failed_title"),
        description: t("recovery.toast_start_failed_desc"),
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
          title: t("recovery.toast_success_title"),
          description: t("recovery.toast_success_desc", { day: newStreak }),
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
            title: t("recovery.toast_paused_title"),
            description: t("recovery.toast_paused_desc"),
          });
        } else {
          toast({
            title: t("recovery.toast_joker_used_title"),
            description: t("recovery.toast_joker_used_desc", { remaining: newJokers }),
          });
        }
      }

      setCheckIns(prev => [data as CheckIn, ...prev]);
    } catch (error) {
      console.error("Error checking in:", error);
      toast({
        title: t("recovery.toast_checkin_failed_title"),
        description: t("recovery.toast_checkin_failed_desc"),
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
        title: t("recovery.toast_reset_failed_title"),
        description: t("recovery.toast_reset_failed_desc"),
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
        title: t("recovery.toast_resumed_title"),
        description:
          journey.jokers_remaining > 0
            ? t("recovery.toast_resumed_desc_with_jokers")
            : t("recovery.toast_resumed_desc_no_jokers"),
      });
    } catch (error) {
      console.error("Error resuming journey:", error);
      toast({
        title: t("recovery.toast_resume_failed_title"),
        description: t("recovery.toast_resume_failed_desc"),
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
        title: t("recovery.toast_abandoned_title"),
        description: t("recovery.toast_abandoned_desc"),
      });
    } catch (error) {
      console.error("Error abandoning journey:", error);
      toast({
        title: t("recovery.toast_abandon_failed_title"),
        description: t("recovery.toast_abandon_failed_desc"),
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
