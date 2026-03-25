import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

export interface FailureDebrief {
  id: string;
  debrief_date: string;
  context: string | null;
  mood: string | null;
  trigger: string | null;
  time_of_day: string | null;
  location: string | null;
  was_alone: boolean;
  ignored_signal: string | null;
  signal_details: string | null;
  action_plan: string | null;
  ai_suggestions: string[] | null;
  is_completed: boolean;
  created_at: string;
}

export interface DebriefFormData {
  context?: string;
  mood?: string;
  trigger?: string;
  time_of_day?: string;
  location?: string;
  was_alone?: boolean;
  ignored_signal?: string;
  signal_details?: string;
  action_plan?: string;
}

interface TodayContext {
  recentTriggers: Array<{
    emotion: string;
    situation: string;
    time_context: string;
    impulse_intensity: number;
  }>;
  todayCheckin: {
    mood: string;
    energy_level: number;
  } | null;
  hasReflection: boolean;
  hasJournal: boolean;
}

export function useFailureDebrief() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { i18n } = useTranslation();
  const [debriefs, setDebriefs] = useState<FailureDebrief[]>([]);
  const [currentDebrief, setCurrentDebrief] = useState<FailureDebrief | null>(null);
  const [todayContext, setTodayContext] = useState<TodayContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchDebriefs = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("failure_debriefs")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching debriefs:", error);
      return;
    }

    setDebriefs(data as FailureDebrief[]);
  }, [user]);

  const fetchTodayContext = useCallback(async () => {
    if (!user) return;

    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    // Fetch recent triggers (last 24 hours)
    const { data: triggers } = await supabase
      .from("trigger_logs")
      .select("emotion, situation, time_context, impulse_intensity")
      .eq("user_id", user.id)
      .gte("logged_at", yesterday)
      .order("logged_at", { ascending: false })
      .limit(5);

    // Fetch today's checkin
    const { data: checkin } = await supabase
      .from("daily_checkins")
      .select("mood, energy_level")
      .eq("user_id", user.id)
      .eq("checkin_date", today)
      .maybeSingle();

    // Check if user did reflection yesterday/today
    const { data: reflection } = await supabase
      .from("daily_reflections")
      .select("id")
      .eq("user_id", user.id)
      .gte("reflection_date", yesterday)
      .limit(1);

    // Check if user journaled recently
    const { data: journal } = await supabase
      .from("journal_entries")
      .select("id")
      .eq("user_id", user.id)
      .gte("entry_date", yesterday)
      .limit(1);

    setTodayContext({
      recentTriggers: (triggers || []) as TodayContext["recentTriggers"],
      todayCheckin: checkin as TodayContext["todayCheckin"],
      hasReflection: (reflection?.length || 0) > 0,
      hasJournal: (journal?.length || 0) > 0,
    });
  }, [user]);

  const startDebrief = useCallback(async (): Promise<FailureDebrief | null> => {
    if (!user) return null;

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from("failure_debriefs")
        .insert({
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      const debrief = data as FailureDebrief;
      setCurrentDebrief(debrief);
      await fetchDebriefs();
      return debrief;
    } catch (error) {
      console.error("Error starting debrief:", error);
      toast({
        title: "Error",
        description: "Could not start debrief",
        variant: "destructive",
      });
      return null;
    } finally {
      setSaving(false);
    }
  }, [user, toast, fetchDebriefs]);

  const updateDebrief = useCallback(async (
    debriefId: string,
    updates: DebriefFormData & { is_completed?: boolean }
  ): Promise<boolean> => {
    if (!user) return false;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("failure_debriefs")
        .update(updates)
        .eq("id", debriefId)
        .eq("user_id", user.id);

      if (error) throw error;

      await fetchDebriefs();
      
      if (updates.is_completed) {
        toast({
          title: "✨ Debrief completed",
          description: "Great job learning from this experience!",
        });
      }
      
      return true;
    } catch (error) {
      console.error("Error updating debrief:", error);
      toast({
        title: "Error",
        description: "Could not save debrief",
        variant: "destructive",
      });
      return false;
    } finally {
      setSaving(false);
    }
  }, [user, toast, fetchDebriefs]);

  const getAISuggestions = useCallback(async (
    debriefData: DebriefFormData
  ): Promise<string[]> => {
    if (!user) return [];

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return [];

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/debrief-suggestions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ debriefData, language: i18n.language }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        return result.suggestions || [];
      }
    } catch (error) {
      console.error("Error getting AI suggestions:", error);
    }
    
    return [];
  }, [user]);

  const deleteDebrief = useCallback(async (debriefId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("failure_debriefs")
        .delete()
        .eq("id", debriefId)
        .eq("user_id", user.id);

      if (error) throw error;

      await fetchDebriefs();
      return true;
    } catch (error) {
      console.error("Error deleting debrief:", error);
      return false;
    }
  }, [user, fetchDebriefs]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchDebriefs(), fetchTodayContext()]);
      setLoading(false);
    };

    if (user) {
      loadData();
    }
  }, [user, fetchDebriefs, fetchTodayContext]);

  return {
    debriefs,
    currentDebrief,
    setCurrentDebrief,
    todayContext,
    loading,
    saving,
    startDebrief,
    updateDebrief,
    getAISuggestions,
    deleteDebrief,
    refetch: fetchDebriefs,
  };
}
