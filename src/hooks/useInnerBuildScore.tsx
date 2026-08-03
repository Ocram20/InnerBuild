import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { untypedTable } from "@/integrations/supabase/untyped-client";
import { useAuth } from "./useAuth";
import { format } from "date-fns";

export interface ModuleBreakdown {
  key: "habits" | "tasks" | "not_to_do" | "detox";
  titleKey: string;
  defaultTitle: string;
  emoji: string;
  completed: number;
  total: number;
  weight: number; // Weight percentage allocated to this module (e.g. 35 or 41.2)
  points: number; // Percentage contribution to overall ring (e.g. 15%)
  progressRatio: number; // 0..1
  textCounter: string; // "2/4" or "Completato"
  isComplete: boolean;
}

export interface ScoreData {
  score: number;
  loading: boolean;
  breakdown: ModuleBreakdown[];
  refetch: () => void;
}

export function useInnerBuildScore(): ScoreData {
  const { user } = useAuth();
  const [score, setScore] = useState<number>(0);
  const [breakdown, setBreakdown] = useState<ModuleBreakdown[]>([]);
  const [loading, setLoading] = useState(true);

  const calculateScore = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const today = format(new Date(), "yyyy-MM-dd");

      // 1. Fetch habits (Base weight: 35)
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
      const completedHabits = new Set(habitLogs?.map((l) => l.habit_id) || []).size;
      const habitsActive = totalHabits > 0;

      // 2. Fetch daily tasks (Base weight: 35)
      const { data: tasksData } = await supabase
        .from("daily_tasks")
        .select("id, is_completed")
        .eq("user_id", user.id)
        .eq("target_date", today);

      const totalTasks = tasksData?.length || 0;
      const completedTasks = tasksData?.filter((t) => t.is_completed).length || 0;
      const tasksActive = totalTasks > 0;

      // 3. Fetch Not To-Do items (Base weight: 15)
      const { data: notToDoItems } = await untypedTable("not_to_do_items")
        .select("id")
        .eq("user_id", user.id)
        .eq("is_active", true);

      const { data: notToDoLogs } = await untypedTable("not_to_do_logs")
        .select("not_to_do_id, status")
        .eq("user_id", user.id)
        .eq("log_date", today);

      const totalNotToDo = notToDoItems?.length || 0;
      const activeNotToDoIds = new Set((notToDoItems || []).map((i: any) => i.id));
      const avoidedNotToDoCount = (notToDoLogs || []).filter(
        (l: any) => l.status === "avoided" && activeNotToDoIds.has(l.not_to_do_id)
      ).length;
      const notToDoActive = totalNotToDo > 0;

      // 4. Fetch Detox / Recovery status (Base weight: 15)
      const { data: detoxData } = await supabase
        .from("detox_challenges")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "active");

      const { data: journeyData } = await supabase
        .from("recovery_journey")
        .select("status, last_check_in")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle();

      const detoxActive =
        (detoxData && detoxData.length > 0) || journeyData?.status === "active";
      const detoxCheckedIn = journeyData?.status === "active" && journeyData.last_check_in === today;

      // Base weights
      const BASE_WEIGHTS = {
        habits: 35,
        tasks: 35,
        not_to_do: 15,
        detox: 15,
      };

      const sumActiveBaseWeight =
        (habitsActive ? BASE_WEIGHTS.habits : 0) +
        (tasksActive ? BASE_WEIGHTS.tasks : 0) +
        (notToDoActive ? BASE_WEIGHTS.not_to_do : 0) +
        (detoxActive ? BASE_WEIGHTS.detox : 0);

      const activeBreakdown: ModuleBreakdown[] = [];
      let totalCalculatedScore = 0;

      if (sumActiveBaseWeight > 0) {
        if (habitsActive) {
          const weight = (BASE_WEIGHTS.habits / sumActiveBaseWeight) * 100;
          const ratio = totalHabits > 0 ? completedHabits / totalHabits : 0;
          const points = ratio * weight;
          totalCalculatedScore += points;
          activeBreakdown.push({
            key: "habits",
            titleKey: "dashboard.breakdown.habits",
            defaultTitle: "Abitudini",
            emoji: "🚰",
            completed: completedHabits,
            total: totalHabits,
            weight,
            points: Math.round(points),
            progressRatio: ratio,
            textCounter: `${completedHabits}/${totalHabits}`,
            isComplete: completedHabits === totalHabits && totalHabits > 0,
          });
        }

        if (tasksActive) {
          const weight = (BASE_WEIGHTS.tasks / sumActiveBaseWeight) * 100;
          const ratio = totalTasks > 0 ? completedTasks / totalTasks : 0;
          const points = ratio * weight;
          totalCalculatedScore += points;
          activeBreakdown.push({
            key: "tasks",
            titleKey: "dashboard.breakdown.tasks",
            defaultTitle: "Task",
            emoji: "🎯",
            completed: completedTasks,
            total: totalTasks,
            weight,
            points: Math.round(points),
            progressRatio: ratio,
            textCounter: `${completedTasks}/${totalTasks}`,
            isComplete: completedTasks === totalTasks && totalTasks > 0,
          });
        }

        if (notToDoActive) {
          const weight = (BASE_WEIGHTS.not_to_do / sumActiveBaseWeight) * 100;
          const ratio = totalNotToDo > 0 ? avoidedNotToDoCount / totalNotToDo : 0;
          const points = ratio * weight;
          totalCalculatedScore += points;
          activeBreakdown.push({
            key: "not_to_do",
            titleKey: "dashboard.breakdown.not_to_do",
            defaultTitle: "Not To-Do",
            emoji: "🚫",
            completed: avoidedNotToDoCount,
            total: totalNotToDo,
            weight,
            points: Math.round(points),
            progressRatio: ratio,
            textCounter: `${avoidedNotToDoCount}/${totalNotToDo}`,
            isComplete: avoidedNotToDoCount === totalNotToDo && totalNotToDo > 0,
          });
        }

        if (detoxActive) {
          const weight = (BASE_WEIGHTS.detox / sumActiveBaseWeight) * 100;
          const ratio = detoxCheckedIn ? 1 : 0;
          const points = ratio * weight;
          totalCalculatedScore += points;
          activeBreakdown.push({
            key: "detox",
            titleKey: "dashboard.breakdown.detox",
            defaultTitle: "Detox",
            emoji: "🛡️",
            completed: detoxCheckedIn ? 1 : 0,
            total: 1,
            weight,
            points: Math.round(points),
            progressRatio: ratio,
            textCounter: detoxCheckedIn ? "Completato" : "0/1",
            isComplete: !!detoxCheckedIn,
          });
        }
      }

      const finalScore = Math.min(100, Math.max(0, Math.round(totalCalculatedScore)));
      setScore(finalScore);
      setBreakdown(activeBreakdown);
    } catch (error) {
      console.error("Error calculating InnerBuild score:", error);
      setScore(0);
      setBreakdown([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    calculateScore();
    const interval = setInterval(() => {
      calculateScore();
    }, 3000);
    return () => clearInterval(interval);
  }, [calculateScore]);

  return { score, breakdown, loading, refetch: calculateScore };
}

