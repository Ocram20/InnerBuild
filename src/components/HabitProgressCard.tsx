import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { 
  Check, 
  MoreHorizontal, 
  Trash2, 
  Edit2, 
  Flame,
  Heart,
  Brain,
  Dumbbell,
  BookOpen,
  Users,
  Palette,
  Sparkles
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useTranslation } from "react-i18next";
import { localizeSuggestedHabitTitle } from "@/lib/templateLocalization";
import { useUiBatchTranslation } from "@/hooks/useUiBatchTranslation";
interface Habit {
  id: string;
  title: string;
  description: string | null;
  frequency: string;
  category: string;
  is_active: boolean;
  completed_today?: boolean;
  streak?: number;
  weeklyProgress?: number;
}

interface HabitProgressCardProps {
  habit: Habit;
  onUpdate: () => void;
  onEdit: (habit: Habit) => void;
}

const categoryIcons: Record<string, React.ElementType> = {
  health: Heart,
  productivity: Sparkles,
  mindfulness: Brain,
  fitness: Dumbbell,
  learning: BookOpen,
  social: Users,
  creativity: Palette,
  general: Flame,
};

const categoryColors: Record<string, string> = {
  health: "text-destructive bg-destructive/10",
  productivity: "text-primary bg-primary/10",
  mindfulness: "text-xp bg-xp/10",
  fitness: "text-accent bg-accent/10",
  learning: "text-level bg-level/10",
  social: "text-pink-500 bg-pink-500/10",
  creativity: "text-orange-500 bg-orange-500/10",
  general: "text-muted-foreground bg-muted",
};

export default function HabitProgressCard({ habit, onUpdate, onEdit }: HabitProgressCardProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const Icon = categoryIcons[habit.category] || Flame;
  const colorClass = categoryColors[habit.category] || categoryColors.general;
  const isAnchor = habit.description?.startsWith("ANCHOR:");
  const anchorText = isAnchor ? habit.description!.replace("ANCHOR:", "") : null;
  
  const rawStrings = useMemo(() => [habit.title, anchorText].filter((v): v is string => typeof v === "string" && v.trim().length > 0), [habit.title, anchorText]);
  const { display } = useUiBatchTranslation(rawStrings, rawStrings.length > 0);
  
  const displayTitle = display(localizeSuggestedHabitTitle(t, habit.title));
  const displayAnchor = anchorText ? display(anchorText) : null;

  const toggleCompletion = async () => {
    if (!user || isLoading) return;
    
    setIsLoading(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      
      if (habit.completed_today) {
        await supabase
          .from("habit_logs")
          .delete()
          .eq("habit_id", habit.id)
          .eq("completed_at", today);
      } else {
        await supabase
          .from("habit_logs")
          .insert({
            habit_id: habit.id,
            user_id: user.id,
            completed_at: today,
          });
        
        // Show completion animation
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 1000);
      }
      
      onUpdate();
    } catch (error) {
      toast({
        title: t("common.error"),
        description: t("dashboard.failed_update_habit"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteHabit = async () => {
    if (!user) return;
    
    try {
      await supabase
        .from("habits")
        .delete()
        .eq("id", habit.id);
      
      toast({
        title: t("habit_card.habit_deleted"),
        description: t("habit_card.habit_removed"),
      });
      
      onUpdate();
    } catch (error) {
      toast({
        title: t("common.error"),
        description: t("dashboard.failed_update_habit"),
        variant: "destructive",
      });
    }
  };

  return (
    <div 
      className={`glass rounded-2xl p-4 shadow-card transition-all duration-300 relative overflow-hidden ${
        habit.completed_today 
          ? "ring-2 ring-primary/30 bg-primary/5" 
          : ""
      }`}
    >
      {/* Completion animation overlay */}
      {showConfetti && (
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 animate-pulse pointer-events-none" />
      )}

      <div className="flex items-start gap-3 relative">
        {/* Completion button */}
        <button
          onClick={toggleCompletion}
          disabled={isLoading}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
            habit.completed_today
              ? "gradient-primary scale-105"
              : "bg-muted hover:bg-primary/20 active:scale-95"
          }`}
        >
          {habit.completed_today ? (
            <Check className="h-5 w-5 text-primary-foreground" />
          ) : (
            <Icon className={`h-5 w-5 ${colorClass.split(" ")[0]}`} />
          )}
        </button>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className={`font-medium text-[15px] leading-tight ${
                habit.completed_today 
                  ? "text-muted-foreground line-through" 
                  : "text-foreground"
              }`}>
                {displayTitle}
              </h3>
              {displayAnchor && (
                <p className="text-[11px] text-muted-foreground font-medium mt-1">
                  {t("create_habit.after_i", { defaultValue: "Dopo che ho" })} <span className="text-foreground/70">{displayAnchor}</span>
                </p>
              )}
              
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className={`text-xs px-2 py-0.5 rounded-full ${colorClass}`}>
                  {t(`habits.categories.${habit.category}`)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {t(`create_habit.frequencies.${habit.frequency}`)}
                </span>
                {habit.streak && habit.streak > 0 && (
                  <span className="text-xs text-accent flex items-center gap-0.5">
                    <Flame className="h-3 w-3" />
                    {t("habits.streak_days", { count: habit.streak })}
                  </span>
                )}
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0 opacity-50 hover:opacity-100 data-[state=open]:opacity-100 data-[state=open]:bg-emerald-500/20 data-[state=open]:text-emerald-400">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(habit)}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  {t("common.edit")}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={deleteHabit}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t("common.delete")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Weekly progress bar */}
          {habit.weeklyProgress !== undefined && (() => {
            const denominator = habit.frequency === "weekly" ? 1 
                              : habit.frequency === "weekdays" ? 5 
                              : habit.frequency === "weekends" ? 2 
                              : 7;
            const displayProgress = Math.min(habit.weeklyProgress, denominator);
            return (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{t("habits.this_week")}</span>
                  <span className="font-medium text-foreground">{displayProgress}/{denominator}</span>
                </div>
                <Progress 
                  value={(displayProgress / denominator) * 100} 
                  className="h-1.5" 
                />
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
