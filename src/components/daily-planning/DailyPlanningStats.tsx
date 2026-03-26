import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Trophy, Flame, Target } from "lucide-react";
import { format, subDays, parseISO, differenceInDays } from "date-fns";

interface DailyPlanningStatsProps {
  userId: string | undefined;
}

export function DailyPlanningStats({ userId }: DailyPlanningStatsProps) {
  const [stats, setStats] = useState({
    planningStreak: 0,
    tasksCompleted: 0,
    perfectDays: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchStats();
    }
  }, [userId]);

  const calculatePlanningStreak = (reflectionDates: string[]): number => {
    if (reflectionDates.length === 0) return 0;

    const sortedDates = [...new Set(reflectionDates)].sort().reverse();
    const today = format(new Date(), "yyyy-MM-dd");
    const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");

    if (sortedDates[0] !== today && sortedDates[0] !== yesterday) {
      return 0;
    }

    let streak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      const currentDate = parseISO(sortedDates[i - 1]);
      const prevDate = parseISO(sortedDates[i]);
      const diff = differenceInDays(currentDate, prevDate);
      
      if (diff === 1) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const fetchStats = async () => {
    if (!userId) return;

    try {
      const { data: tasks } = await supabase
        .from("daily_tasks")
        .select("is_completed, target_date")
        .eq("user_id", userId);

      const { data: reflections } = await supabase
        .from("daily_reflections")
        .select("reflection_date")
        .eq("user_id", userId);

      const tasksCompleted = (tasks || []).filter(t => t.is_completed).length;

      const reflectionDates = (reflections || []).map(r => r.reflection_date);
      const planningStreak = calculatePlanningStreak(reflectionDates);

      const tasksByDate = (tasks || []).reduce((acc, t) => {
        if (!acc[t.target_date]) acc[t.target_date] = { total: 0, completed: 0 };
        acc[t.target_date].total++;
        if (t.is_completed) acc[t.target_date].completed++;
        return acc;
      }, {} as Record<string, { total: number; completed: number }>);
      
      const perfectDays = Object.values(tasksByDate).filter(d => d.total > 0 && d.completed === d.total).length;

      setStats({
        planningStreak,
        tasksCompleted,
        perfectDays,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-4 animate-pulse bg-muted/50" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      <Card className="p-4 glass shadow-card text-center relative overflow-hidden">
        <Flame className={`h-6 w-6 mx-auto mb-2 ${stats.planningStreak >= 3 ? 'text-orange-500 animate-pulse' : 'text-orange-500'}`} />
        <p className="text-2xl font-bold">{stats.planningStreak}</p>
        <p className="text-xs text-muted-foreground">{"Serie Giornaliera"}</p>
      </Card>

      <Card className="p-4 glass shadow-card text-center">
        <Trophy className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
        <p className="text-2xl font-bold">{stats.tasksCompleted}</p>
        <p className="text-xs text-muted-foreground">{"Task completati"}</p>
      </Card>

      <Card className="p-4 glass shadow-card text-center">
        <Target className="h-6 w-6 mx-auto mb-2 text-primary" />
        <p className="text-2xl font-bold">{stats.perfectDays}</p>
        <p className="text-xs text-muted-foreground">{"Giorni perfetti"}</p>
      </Card>
    </div>
  );
}