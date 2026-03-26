import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { untypedTable } from "@/integrations/supabase/untyped-client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export interface HabitAdaptation {
  habit_title: string;
  current_completion_rate: number;
  issue: string;
  suggested_change: string;
  reason: string;
}

export interface TriggerPattern {
  pattern: string;
  frequency: string;
  common_emotions: string[];
  common_situations: string[];
  prevention_tip: string;
}

export interface AIInsight {
  id: string;
  user_id: string;
  insight_type: string;
  title: string;
  summary: string;
  detailed_analysis: {
    habit_adaptations: HabitAdaptation[];
    trigger_patterns: TriggerPattern[];
  };
  recommendations: string[];
  period_start: string;
  period_end: string;
  created_at: string;
  is_read: boolean;
}

export function useAIInsights() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { i18n } = useTranslation();
  const [latestInsight, setLatestInsight] = useState<AIInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchLatestInsight = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await untypedTable('ai_insights')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching insight:", error);
      }

      if (data) {
        // Cast the JSONB field properly
        const insight: AIInsight = {
          ...data,
          detailed_analysis: data.detailed_analysis as unknown as AIInsight['detailed_analysis'],
        };
        setLatestInsight(insight);
      } else {
        setLatestInsight(null);
      }
    } catch (err) {
      console.error("Failed to fetch AI insight:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchLatestInsight();
  }, [fetchLatestInsight]);

  const generateInsight = async () => {
    if (!user) return;

    setGenerating(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-coach-engine`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ language: i18n.language?.substring(0, 2) || "en" }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to generate insight");
      }

      toast({
        title: "AI Report Generated! 🎯",
        description: "Your personalized wellness insights are ready.",
      });

      await fetchLatestInsight();
    } catch (err) {
      console.error("Failed to generate insight:", err);
      toast({
        title: "Generation Failed",
        description: err instanceof Error ? err.message : "Unable to generate AI report",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const markAsRead = async (insightId: string) => {
    if (!user) return;

    try {
      await untypedTable('ai_insights')
        .update({ is_read: true })
        .eq('id', insightId)
        .eq('user_id', user.id);

      setLatestInsight(prev => prev ? { ...prev, is_read: true } : null);
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const shouldShowNewReport = () => {
    if (!latestInsight) return true;
    
    const lastReportDate = new Date(latestInsight.created_at);
    const daysSinceReport = Math.floor(
      (Date.now() - lastReportDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    return daysSinceReport >= 4;
  };

  return {
    latestInsight,
    loading,
    generating,
    generateInsight,
    markAsRead,
    shouldShowNewReport,
    refetch: fetchLatestInsight,
  };
}
