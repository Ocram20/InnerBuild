import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { untypedTable } from "@/integrations/supabase/untyped-client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";
import { useTranslation } from "react-i18next";

export interface HabitSuggestion {
  habit_id: string;
  habit_title: string;
  current_completion_rate: number;
  issue: string;
  suggested_title: string;
  suggested_description: string;
  reason: string;
  status?: "pending" | "accepted" | "dismissed";
}

export interface HabitReport {
  id: string;
  user_id: string;
  insight_type: string;
  title: string;
  summary: string;
  detailed_analysis: {
    habit_suggestions: HabitSuggestion[];
    tips: string[];
  };
  recommendations: string[];
  period_start: string;
  period_end: string;
  created_at: string;
  is_read: boolean;
}

export function useHabitReport() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { i18n } = useTranslation();
  const [report, setReport] = useState<HabitReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchReport = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await untypedTable('ai_insights')
        .select('*')
        .eq('user_id', user.id)
        .eq('insight_type', 'habit_report')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching habit report:", error);
      }

      if (data) {
        const typedReport: HabitReport = {
          ...data,
          detailed_analysis: data.detailed_analysis as unknown as HabitReport['detailed_analysis'],
        };
        setReport(typedReport);
      } else {
        setReport(null);
      }
    } catch (err) {
      console.error("Failed to fetch habit report:", err);
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
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-habit-report`,
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
        title: "Habit Report Generated! 🎯",
        description: "Your personalized habit insights are ready.",
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

  const acceptSuggestion = async (habitId: string, suggestedTitle: string, suggestedDescription: string) => {
    if (!user || !report) return;

    try {
      // Update the habit with the suggested values
      const { error: habitError } = await supabase
        .from('habits')
        .update({ 
          title: suggestedTitle,
          description: suggestedDescription,
          updated_at: new Date().toISOString()
        })
        .eq('id', habitId)
        .eq('user_id', user.id);

      if (habitError) throw habitError;

      // Update the suggestion status in the database
      const updatedSuggestions = report.detailed_analysis.habit_suggestions.map(s =>
        s.habit_id === habitId ? { ...s, status: "accepted" as const } : s
      );

      const { error: insightError } = await untypedTable('ai_insights')
        .update({
          detailed_analysis: {
            tips: report.detailed_analysis.tips,
            habit_suggestions: updatedSuggestions.map(s => ({
              habit_id: s.habit_id,
              habit_title: s.habit_title,
              current_completion_rate: s.current_completion_rate,
              issue: s.issue,
              suggested_title: s.suggested_title,
              suggested_description: s.suggested_description,
              reason: s.reason,
              status: s.status || "pending",
            })),
          }
        })
        .eq('id', report.id)
        .eq('user_id', user.id);

      if (insightError) throw insightError;

      // Update local state
      setReport(prev => {
        if (!prev) return null;
        return {
          ...prev,
          detailed_analysis: {
            ...prev.detailed_analysis,
            habit_suggestions: updatedSuggestions,
          },
        };
      });

      toast({
        title: "Habit Updated! ✓",
        description: `Changed to "${suggestedTitle}"`,
      });
    } catch (err) {
      console.error("Failed to accept suggestion:", err);
      toast({
        title: "Error",
        description: "Failed to update habit",
        variant: "destructive",
      });
    }
  };

  const dismissSuggestion = async (habitId: string) => {
    if (!user || !report) return;

    try {
      // Update the suggestion status in the database
      const updatedSuggestions = report.detailed_analysis.habit_suggestions.map(s =>
        s.habit_id === habitId ? { ...s, status: "dismissed" as const } : s
      );

      const { error } = await untypedTable('ai_insights')
        .update({
          detailed_analysis: {
            tips: report.detailed_analysis.tips,
            habit_suggestions: updatedSuggestions.map(s => ({
              habit_id: s.habit_id,
              habit_title: s.habit_title,
              current_completion_rate: s.current_completion_rate,
              issue: s.issue,
              suggested_title: s.suggested_title,
              suggested_description: s.suggested_description,
              reason: s.reason,
              status: s.status || "pending",
            })),
          }
        })
        .eq('id', report.id)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      setReport(prev => {
        if (!prev) return null;
        return {
          ...prev,
          detailed_analysis: {
            ...prev.detailed_analysis,
            habit_suggestions: updatedSuggestions,
          },
        };
      });

      toast({
        title: "Suggestion dismissed",
        description: "The habit remains unchanged",
      });
    } catch (err) {
      console.error("Failed to dismiss suggestion:", err);
    }
  };

  const markAsRead = async (reportId: string) => {
    if (!user) return;

    try {
      await untypedTable('ai_insights')
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
    acceptSuggestion,
    dismissSuggestion,
    markAsRead,
    canGenerateReport,
    getDaysUntilNextReport,
    refetch: fetchReport,
  };
}
