import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Check, MoreHorizontal, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface Habit {
  id: string;
  title: string;
  description: string | null;
  frequency: string;
  is_active: boolean;
  completed_today?: boolean;
}

interface HabitCardProps {
  habit: Habit;
  onUpdate: () => void;
}

export default function HabitCard({ habit, onUpdate }: HabitCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const toggleCompletion = async () => {
    if (!user || isLoading) return;
    
    setIsLoading(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      
      if (habit.completed_today) {
        // Remove completion
        await supabase
          .from("habit_logs")
          .delete()
          .eq("habit_id", habit.id)
          .eq("completed_at", today);
      } else {
        // Add completion
        await supabase
          .from("habit_logs")
          .insert({
            habit_id: habit.id,
            user_id: user.id,
            completed_at: today,
          });
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
      className={`glass rounded-xl p-3 shadow-card transition-all duration-300 active:scale-[0.98] ${
        habit.completed_today 
          ? "border-l-4 border-l-primary bg-primary/5" 
          : "border-l-4 border-l-transparent"
      }`}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={toggleCompletion}
          disabled={isLoading}
          className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
            habit.completed_today
              ? "bg-primary border-primary scale-110"
              : "border-muted-foreground/30 hover:border-primary active:scale-95"
          }`}
        >
          {habit.completed_today && <Check className="h-4 w-4 text-primary-foreground" />}
        </button>
        
        <button 
          onClick={toggleCompletion}
          disabled={isLoading}
          className="flex-1 min-w-0 text-left"
        >
          <h3 className={`font-medium text-[15px] leading-tight transition-all duration-300 min-w-0 truncate ${
            habit.completed_today 
              ? "text-muted-foreground line-through decoration-primary/50" 
              : "text-foreground"
          }`}>
            {habit.title}
          </h3>
          {habit.description && (
            <p className="text-sm text-muted-foreground/70 truncate mt-0.5">{habit.description}</p>
          )}
        </button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0 opacity-50 hover:opacity-100">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              onClick={deleteHabit}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
