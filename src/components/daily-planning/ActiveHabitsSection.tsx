import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Repeat, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import LoadingSpinner from "@/components/LoadingSpinner";
import { localizeSuggestedHabitTitle } from "@/lib/templateLocalization";

interface Habit {
  id: string;
  title: string;
  category: string;
  completed_today: boolean;
}

interface ActiveHabitsSectionProps {
  userId: string | undefined;
  targetDate: string;
}

const categoryColors: Record<string, string> = {
  health: "bg-green-500/10 text-green-600",
  productivity: "bg-blue-500/10 text-blue-600",
  mindfulness: "bg-purple-500/10 text-purple-600",
  social: "bg-orange-500/10 text-orange-600",
  learning: "bg-yellow-500/10 text-yellow-600",
  general: "bg-gray-500/10 text-gray-600",
};

export function ActiveHabitsSection({ userId, targetDate }: ActiveHabitsSectionProps) {
  const { t } = useTranslation();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const fetchHabits = useCallback(async () => {
    if (!userId) return;

    // Fetch active habits
    const { data: habitsData, error: habitsError } = await supabase
      .from("habits")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("created_at", { ascending: true });

    if (habitsError) {
      console.error("Error fetching habits:", habitsError);
      setLoading(false);
      return;
    }

    // Fetch logs for target date
    const { data: logsData } = await supabase
      .from("habit_logs")
      .select("habit_id")
      .eq("user_id", userId)
      .eq("completed_at", targetDate);

    const completedHabitIds = new Set(logsData?.map(log => log.habit_id) || []);

    const habitsWithStatus = (habitsData || []).map(habit => ({
      id: habit.id,
      title: habit.title,
      category: habit.category,
      completed_today: completedHabitIds.has(habit.id),
    }));

    setHabits(habitsWithStatus);
    setLoading(false);
  }, [userId, targetDate]);

  useEffect(() => {
    if (userId) {
      fetchHabits();
    }
  }, [userId, targetDate, fetchHabits]);

  // Refetch when window gains focus (sync with Dashboard)
  useEffect(() => {
    const handleFocus = () => {
      if (userId) {
        fetchHabits();
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [userId, fetchHabits]);


  const toggleHabit = async (habit: Habit) => {
    if (!userId) return;

    if (habit.completed_today) {
      // Remove log
      const { error } = await supabase
        .from("habit_logs")
        .delete()
        .eq("habit_id", habit.id)
        .eq("user_id", userId)
        .eq("completed_at", targetDate);

      if (error) {
        toast({
          title: t("common.error"),
          description: t("active_habits_section.error_remove"),
          variant: "destructive",
        });
        return;
      }
    } else {
      // Add log
      const { error } = await supabase
        .from("habit_logs")
        .insert({
          habit_id: habit.id,
          user_id: userId,
          completed_at: targetDate,
        });

      if (error) {
        toast({
          title: t("common.error"),
          description: t("active_habits_section.error_mark"),
          variant: "destructive",
        });
        return;
      }
    }

    setHabits(habits.map(h => 
      h.id === habit.id ? { ...h, completed_today: !h.completed_today } : h
    ));
  };

  const completedCount = habits.filter(h => h.completed_today).length;

  return (
    <Card className="glass shadow-card animate-slide-up" style={{ animationDelay: "0.2s" }}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-2 rounded-lg bg-accent/10">
              <Repeat className="h-5 w-5 text-accent" />
            </div>
            {t("active_habits_section.title")}
          </CardTitle>
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <span className="font-semibold text-success">{completedCount}</span>
              <span>/</span>
              <span>{habits.length}</span>
              <span className="ml-1">{t("active_habits_section.completed")}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-4"><LoadingSpinner /></div>
        ) : habits.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Repeat className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p>{t("active_habits_section.no_active")}</p>
            <p className="text-sm">{t("active_habits_section.create_hint")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {habits.map((habit) => (
              <div
                key={habit.id}
                onClick={() => toggleHabit(habit)}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all hover:scale-[1.02] ${
                  habit.completed_today
                    ? "bg-success/5 border-success/30"
                    : "bg-muted/30 border-border/50 hover:border-border"
                }`}
              >
                <Checkbox
                  checked={habit.completed_today}
                  className="shrink-0 pointer-events-none"
                />
                <div className="flex-1 min-w-0">
                  <p className={`font-medium truncate text-sm sm:text-base ${habit.completed_today ? "line-through text-muted-foreground" : ""}`}>
                    {localizeSuggestedHabitTitle(t, habit.title)}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full inline-block mt-1 ${categoryColors[habit.category] || categoryColors.general}`}>
                    {t(`habits.categories.${habit.category}`)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
