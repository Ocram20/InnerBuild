import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { untypedTable } from "@/integrations/supabase/untyped-client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

export interface TriggerLog {
  id: string;
  logged_at: string;
  bad_habit?: string | null;
  impulse_intensity: number;
  emotion: string;
  situation: string;
  time_context: string;
  location_context: string | null;
  was_alone: boolean;
  notes: string | null;
  created_at: string;
}

export interface TriggerInsight {
  id: string;
  insight_type: "pattern" | "warning" | "suggestion";
  title: string;
  description: string;
  pattern_data: Record<string, unknown> | null;
  is_read: boolean;
  generated_at: string;
}

export interface HeatmapData {
  day: number; // 0-6 (Sun-Sat)
  hour: number; // 0-23
  count: number;
  avgIntensity: number;
}

export function useTriggerTracking() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [logs, setLogs] = useState<TriggerLog[]>([]);
  const [insights, setInsights] = useState<TriggerInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  const fetchLogs = useCallback(async () => {
    if (!user) return;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data, error } = await untypedTable("trigger_logs")
      .select("*")
      .eq("user_id", user.id)
      .gte("logged_at", thirtyDaysAgo.toISOString())
      .order("logged_at", { ascending: false });

    if (error) {
      console.error("Error fetching trigger logs:", error);
      return;
    }

    setLogs(data as TriggerLog[]);
  }, [user]);

  const fetchInsights = useCallback(async () => {
    if (!user) return;

    const { data, error } = await untypedTable("trigger_insights")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching insights:", error);
      return;
    }

    setInsights(data as TriggerInsight[]);
  }, [user]);

  const logTrigger = useCallback(async (data: {
    bad_habit?: string;
    impulse_intensity: number;
    emotion: string;
    situation: string;
    time_context: string;
    location_context?: string;
    was_alone: boolean;
    notes?: string;
  }) => {
    if (!user) return false;

    const payload: Record<string, unknown> = {
      user_id: user.id,
      impulse_intensity: data.impulse_intensity,
      emotion: data.emotion,
      situation: data.situation,
      time_context: data.time_context,
      location_context: data.location_context || null,
      was_alone: data.was_alone,
      notes: data.notes || null,
    };

    if (data.bad_habit) {
      payload.bad_habit = data.bad_habit;
    }

    let { error } = await untypedTable("trigger_logs").insert(payload);

    // Fallback if bad_habit column is not in DB schema yet
    if (error && (error as any).code === "PGRST204" && payload.bad_habit) {
      console.warn("Retrying trigger log insert without bad_habit column:", error);
      delete payload.bad_habit;
      const retryResult = await untypedTable("trigger_logs").insert(payload);
      error = retryResult.error;
    }

    if (error) {
      console.error("Error logging trigger:", error);
      toast({
        title: t("common.error"),
        description: t("trigger_tracking.toast_log_failed"),
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: t("trigger_tracking.toast_logged_title"),
      description: t("trigger_tracking.toast_logged_desc"),
    });

    await fetchLogs();
    return true;
  }, [user, toast, fetchLogs]);

  const analyzePatterns = useCallback(async () => {
    if (!user) return;

    setAnalyzing(true);
    try {
      // Get the user's session token for authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        console.error("No auth session found");
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-triggers`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ language: i18n.resolvedLanguage || i18n.language || "en" }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.insights) {
          setInsights(result.insights);
        }
        if (result.message) {
          toast({
            title: t("common.success"),
            description: result.message,
          });
        }
      }
    } catch (error) {
      console.error("Error analyzing triggers:", error);
    } finally {
      setAnalyzing(false);
    }
  }, [user, toast, t, i18n.resolvedLanguage, i18n.language]);

  const getHeatmapData = useCallback((): HeatmapData[] => {
    const heatmap: Record<string, { count: number; intensities: number[] }> = {};

    for (const log of logs) {
      const date = new Date(log.logged_at);
      const day = date.getDay();
      const hour = date.getHours();
      const key = `${day}-${hour}`;

      if (!heatmap[key]) {
        heatmap[key] = { count: 0, intensities: [] };
      }
      heatmap[key].count++;
      heatmap[key].intensities.push(log.impulse_intensity);
    }

    const result: HeatmapData[] = [];
    for (const [key, data] of Object.entries(heatmap)) {
      const [day, hour] = key.split("-").map(Number);
      result.push({
        day,
        hour,
        count: data.count,
        avgIntensity: data.intensities.reduce((a, b) => a + b, 0) / data.intensities.length,
      });
    }

    return result;
  }, [logs]);

  const deleteTrigger = useCallback(async (id: string) => {
    if (!user) return;

    const { error } = await untypedTable("trigger_logs")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting trigger:", error);
      return;
    }

    setLogs(prev => prev.filter(l => l.id !== id));
  }, [user]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchLogs(), fetchInsights()]);
      setLoading(false);
    };

    if (user) {
      loadData();
    }
  }, [user, fetchLogs, fetchInsights]);

  return {
    logs,
    insights,
    loading,
    analyzing,
    logTrigger,
    analyzePatterns,
    getHeatmapData,
    deleteTrigger,
    refetch: fetchLogs,
  };
}
