import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { Leaf, ChevronLeft, ChevronRight, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HabitProgressDetail } from "@/hooks/useProgressData";
import { dateFnsLocale } from "@/lib/dateFnsLocale";
import { useUiBatchTranslation } from "@/hooks/useUiBatchTranslation";

interface Props {
  habits: HabitProgressDetail[];
  days?: number;
}

export function HabitsProgressSection({ habits, days = 14 }: Props) {
  const { t, i18n } = useTranslation();
  const dfLocale = dateFnsLocale(i18n.resolvedLanguage || i18n.language);
  const [activeIndex, setActiveIndex] = useState(0);
  const isAnnual = days > 30;
  const habit = habits.length > 0 ? habits[activeIndex] : null;

  // For annual view, group dailyData by week
  const weeklyData = useMemo(() => {
    if (!isAnnual || !habit) return null;
    const weeks: { weekLabel: string; completed: number; total: number }[] = [];
    for (let i = 0; i < habit.dailyData.length; i += 7) {
      const chunk = habit.dailyData.slice(i, i + 7);
      const completed = chunk.filter(d => d.completed).length;
      weeks.push({
        weekLabel: format(new Date(chunk[0].date), "MMM d", { locale: dfLocale }),
        completed,
        total: chunk.length,
      });
    }
    return weeks;
  }, [habit, isAnnual, dfLocale]);
  if (!habit) {
    return (
      <div className="glass rounded-2xl p-6 text-center animate-fade-in">
        <Leaf className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">{t("habits_progress_section.no_active_habits")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Habit selector - horizontal scroll */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveIndex(Math.max(0, activeIndex - 1))}
          disabled={activeIndex === 0}
          className="p-1 rounded-lg hover:bg-muted disabled:opacity-30 transition"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex-1 text-center">
          <p className="font-semibold text-sm truncate">{display(habit.title)}</p>
          <p className="text-xs text-muted-foreground">
            {t("habits_progress_section.habit_position", { current: activeIndex + 1, total: habits.length })}
          </p>
        </div>
        <button
          onClick={() => setActiveIndex(Math.min(habits.length - 1, activeIndex + 1))}
          disabled={activeIndex === habits.length - 1}
          className="p-1 rounded-lg hover:bg-muted disabled:opacity-30 transition"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Stats row */}
      <div className="flex gap-4 justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold text-primary">{habit.completionRate}%</p>
          <p className="text-[10px] text-muted-foreground">{t("habits_progress_section.completion")}</p>
        </div>
        {habit.streak > 0 && (
          <div className="text-center">
            <p className="text-2xl font-bold text-accent flex items-center justify-center gap-1">
              <Flame className="h-5 w-5" />
              {habit.streak}
            </p>
            <p className="text-[10px] text-muted-foreground">{t("habits_progress_section.day_streak")}</p>
          </div>
        )}
      </div>

      {/* Day/Week chart */}
      <div className="glass rounded-xl p-4">
        {isAnnual && weeklyData ? (
          <div className="overflow-x-auto">
            <div className="flex items-end gap-[3px] h-24" style={{ minWidth: `${weeklyData.length * 12}px` }}>
              {weeklyData.map((week, i) => {
                const rate = week.total > 0 ? week.completed / week.total : 0;
                return (
                  <div
                    key={i}
                    className="flex-1 rounded-t transition-all"
                    style={{
                      height: `${Math.max(rate * 100, 4)}%`,
                      minHeight: "3px",
                      minWidth: "6px",
                      backgroundColor: rate > 0.7 ? "hsl(var(--primary))" : rate > 0.3 ? "hsl(var(--primary) / 0.5)" : "hsl(var(--muted))",
                    }}
                    title={`${week.weekLabel}: ${week.completed}/${week.total}`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[9px] text-muted-foreground">{weeklyData[0]?.weekLabel}</span>
              <span className="text-[9px] text-muted-foreground">{weeklyData[weeklyData.length - 1]?.weekLabel}</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {habit.dailyData.map((day, i) => (
              <div key={day.date} className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    "w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-300",
                    day.completed
                      ? "bg-primary/20 border border-primary/40"
                      : "bg-muted/50 border border-transparent"
                  )}
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  {day.completed && (
                    <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                  )}
                </div>
                <span className="text-[9px] text-muted-foreground">
                  {format(new Date(day.date), "d", { locale: dfLocale })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
