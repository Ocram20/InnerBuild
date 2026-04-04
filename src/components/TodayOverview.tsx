import { CheckCircle2, Circle, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { localizeSuggestedHabitTitle } from "@/lib/templateLocalization";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
interface Habit {
  id: string;
  title: string;
  completed_today?: boolean;
}

interface HabitAdaptation {
  id: string;
  habit_id: string;
  adaptation_type: string;
  original_value: string | null;
  suggested_value: string;
  reason: string;
}

interface TodayOverviewProps {
  habits: Habit[];
  onToggleHabit: (habitId: string) => void;
  getAdaptationForHabit?: (habitId: string) => HabitAdaptation | undefined;
}

export default function TodayOverview({ habits, onToggleHabit, getAdaptationForHabit }: TodayOverviewProps) {
  const { t } = useTranslation();
  const completedCount = habits.filter(h => h.completed_today).length;
  const totalCount = habits.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const allComplete = totalCount > 0 && completedCount === totalCount;

  return (
    <div className={`rounded-2xl border border-border/60 bg-card p-5 relative overflow-hidden ${
      allComplete ? "ring-2 ring-primary/30" : ""
    }`}>
      {allComplete && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 pointer-events-none" />
      )}

      <div className="relative">
        {/* Progress bar */}
        <div className="h-2 bg-muted rounded-full overflow-hidden mb-4">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Habit toggles */}
        {habits.length > 0 ? (
          <div className="space-y-2">
            {habits.slice(0, 5).map((habit) => {
              const adaptation = getAdaptationForHabit?.(habit.id);
              
              return (
                <div
                  key={habit.id}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                    habit.completed_today
                      ? "bg-primary/10 border border-primary/20"
                      : adaptation
                        ? "bg-primary/5 border border-primary/30"
                        : "bg-muted/50 hover:bg-muted border border-transparent"
                  }`}
                >
                  <button
                    onClick={() => onToggleHabit(habit.id)}
                    className="flex items-center gap-3 flex-1 text-left min-w-0"
                  >
                    {habit.completed_today ? (
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    )}
                    <span className={`text-sm font-medium truncate block max-w-full ${
                      habit.completed_today ? "line-through text-muted-foreground" : "text-foreground"
                    }`}>
                      {localizeSuggestedHabitTitle(t, habit.title)}
                    </span>
                  </button>
                  
                  {adaptation && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-medium shrink-0">
                            <Sparkles className="h-2.5 w-2.5" />
                            AI
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="left" className="max-w-[200px]">
                          <p className="text-xs">{adaptation.reason}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              );
            })}
            {habits.length > 5 && (
              <p className="text-xs text-muted-foreground text-center pt-1">
                {t("today_overview.more_habits", { count: habits.length - 5 })}
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">{t("today_overview.no_habits")}</p>
        )}

        {/* Motivational message */}
        {habits.length > 0 && (
          <p className="text-sm text-muted-foreground mt-4 text-center">
            {allComplete
              ? t("today_overview.all_done")
              : completedCount === 0
                ? t("today_overview.lets_go")
                : t("today_overview.left_count", { count: totalCount - completedCount })}
          </p>
        )}
      </div>
    </div>
  );
}
