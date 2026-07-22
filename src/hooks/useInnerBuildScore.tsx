import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { format } from "date-fns";

interface ScoreData {
  score: number;
  loading: boolean;
}

export function useInnerBuildScore(): ScoreData {
  const { user } = useAuth();
  const [score, setScore] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      calculateScore();
    } else {
      setLoading(false);
    }
  }, [user]);

  const calculateScore = async () => {
    if (!user) return;

    try {
      const today = format(new Date(), "yyyy-MM-dd");

      // 1. Get habits completion (40%)
      const { data: habitsData } = await supabase
        .from("habits")
        .select("id")
        .eq("user_id", user.id)
        .eq("is_active", true);

      const { data: habitLogs } = await supabase
        .from("habit_logs")
        .select("habit_id")
        .eq("user_id", user.id)
        .eq("completed_at", today);

      const totalHabits = habitsData?.length || 0;
      const completedHabits = new Set(habitLogs?.map(l => l.habit_id) || []).size;
      
      // If no habits planned, default to max score for this section
      const habitsScore = totalHabits > 0 
        ? (completedHabits / totalHabits) * 40 
        : 40;

      // 2. Get tasks completion (30%)
      const { data: tasksData } = await supabase
        .from("daily_tasks")
        .select("id, is_completed")
        .eq("user_id", user.id)
        .eq("target_date", today);

      const totalTasks = tasksData?.length || 0;
      const completedTasks = tasksData?.filter(t => t.is_completed).length || 0;
      
      // If no tasks planned, default to max score for this section
      const tasksScore = totalTasks > 0 
        ? (completedTasks / totalTasks) * 30 
        : 30;

      // 3. Get recovery status (20%)
      const { data: journeyData } = await supabase
        .from("recovery_journey")
        .select("status, last_check_in")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle();

      const recoveryScore = journeyData?.status === "active" && journeyData.last_check_in === today ? 20 : 0;

      // 4. Get reflection/journal completion (10%)
      const { data: reflectionData } = await supabase
        .from("daily_reflections")
        .select("id")
        .eq("user_id", user.id)
        .eq("reflection_date", today)
        .maybeSingle();

      const { data: journalData } = await supabase
        .from("journal_entries")
        .select("id")
        .eq("user_id", user.id)
        .eq("entry_date", today)
        .maybeSingle();

      const reflectionScore = (reflectionData || journalData) ? 10 : 0;

      // Calculate total score
      const totalScore = Math.round(habitsScore + tasksScore + recoveryScore + reflectionScore);
      setScore(Math.min(100, Math.max(0, totalScore)));
    } catch (error) {
      console.error("Error calculating InnerBuild score:", error);
      setScore(0);
    } finally {
      setLoading(false);
    }
  };

  return { score, loading };
}
