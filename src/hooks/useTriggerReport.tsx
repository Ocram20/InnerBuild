import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export interface TriggerCause {
  cause: string;
  frequency: string;
  description: string;
}

export interface TimingPattern {
  when: string;
  frequency: string;
  likely_reason: string;
}

export interface TriggerSolution {
  for_cause: string;
  strategy: string;
  why_it_helps: string;
}

export interface TriggerReport {
  id: string;
  user_id: string;
  insight_type: string;
  title: string;
  summary: string;
  detailed_analysis: {
    main_causes: TriggerCause[];
    timing_patterns: TimingPattern[];
    solutions: TriggerSolution[];
    encouragement: string;
  };
  recommendations: string[];
  period_start: string;
  period_end: string;
  created_at: string;
  is_read: boolean;
}

export function useTriggerReport() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [report, setReport] = useState<TriggerReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchReport = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('user_id', user.id)
        .eq('insight_type', 'trigger_report')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching trigger report:", error);
      }

      if (data) {
        const typedReport: TriggerReport = {
          ...data,
          detailed_analysis: data.detailed_analysis as unknown as TriggerReport['detailed_analysis'],
        };
        setReport(typedReport);
      } else {
        setReport(null);
      }
    } catch (err) {
      console.error("Failed to fetch trigger report:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const canGenerateReport = useCallback(() => {
    if (!report) return true;
    
    const lastReportDate = new Date(report.created_at);
    const daysSinceReport = Math.floor(
      (Date.now() - lastReportDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    return daysSinceReport >= 4;
  }, [report]);

  const getDaysUntilNextReport = useCallback(() => {
    if (!report) return 0;
    
    const lastReportDate = new Date(report.created_at);
    const daysSinceReport = Math.floor(
      (Date.now() - lastReportDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    return Math.max(0, 4 - daysSinceReport);
  }, [report]);

  const { i18n } = useTranslation();

  const generateReport = async () => {
    if (!user) return;

    if (!canGenerateReport()) {
      toast({
        title: "Please wait",
        description: `You can generate a new report in ${getDaysUntilNextReport()} day(s)`,
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-trigger-report`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ language: i18n.language }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to generate report");
      }

      toast({
        title: "Trigger Report Generated! 🎯",
        description: "Your trigger pattern analysis is ready.",
      });

      await fetchReport();
    } catch (err) {
      console.error("Failed to generate report:", err);
      toast({
        title: "Generation Failed",
        description: err instanceof Error ? err.message : "Unable to generate report",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const markAsRead = async (reportId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('ai_insights')
        .update({ is_read: true })
        .eq('id', reportId)
        .eq('user_id', user.id);

      setReport(prev => prev ? { ...prev, is_read: true } : null);
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  return {
    report,
    loading,
    generating,
    generateReport,
    markAsRead,
    canGenerateReport,
    getDaysUntilNextReport,
    refetch: fetchReport,
  };
}
