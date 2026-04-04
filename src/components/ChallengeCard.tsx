import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Flame, MoreHorizontal, Trash2, RefreshCw, Check, Pause, Play, Zap, ShieldAlert } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTranslation } from "react-i18next";
import { localizeSuggestedChallenge } from "@/lib/templateLocalization";

interface Challenge {
  id: string;
  title: string;
  description: string | null;
  duration_days: number;
  start_date: string;
  current_streak: number;
  longest_streak: number;
  status: string;
  last_check_in: string | null;
  jokers_remaining?: number;
}

interface ChallengeCardProps {
  challenge: Challenge;
  onUpdate: () => void;
}

export default function ChallengeCard({ challenge, onUpdate }: ChallengeCardProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const checkedInToday = challenge.last_check_in === today;
  const currentDay = challenge.current_streak;
  const progressPercent = Math.min((currentDay / challenge.duration_days) * 100, 100);
  const isCompleted = currentDay >= challenge.duration_days;
  const daysLeft = challenge.duration_days - currentDay;
  const jokers = challenge.jokers_remaining ?? 3;
  const isPausedByJokers = challenge.status === "paused" && jokers <= 0;
  const localized = localizeSuggestedChallenge(t, {
    title: challenge.title,
    description: challenge.description,
    science_note: null,
    daily_steps: null,
  });

  const checkIn = async () => {
    if (!user || isLoading || checkedInToday) return;
    
    setIsLoading(true);
    try {
      const newStreak = currentDay + 1;
      const newLongest = Math.max(newStreak, challenge.longest_streak);
      const completed = newStreak >= challenge.duration_days;
      
      await supabase
        .from("detox_challenges")
        .update({
          current_streak: newStreak,
          longest_streak: newLongest,
          last_check_in: today,
          status: completed ? "completed" : "active",
        })
        .eq("id", challenge.id);
      
      if (completed) {
        toast({
          title: t("challenge_card.challenge_complete"),
          description: t("challenge_card.completed_challenge", { days: challenge.duration_days }),
        });
      } else {
        toast({
          title: t("challenge_card.day_checked"),
          description: t("challenge_card.day_done", { day: newStreak }),
        });
      }
      
      onUpdate();
    } catch (error) {
      toast({
        title: t("common.error"),
        description: t("challenge_card.failed_checkin", { defaultValue: "Failed to check in" }),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetChallenge = async () => {
    if (!user) return;
    
    try {
      await supabase
        .from("detox_challenges")
        .update({
          current_streak: 0,
          start_date: today,
          last_check_in: null,
          status: "active",
          jokers_remaining: 3,
          progress_offset: 0,
        })
        .eq("id", challenge.id);
      
      toast({
        title: t("challenge_card.fresh_start"),
        description: t("challenge_card.fresh_start_desc"),
      });
      
      onUpdate();
    } catch (error) {
      toast({
        title: t("common.error"),
        description: t("challenge_card.failed_reset", { defaultValue: "Failed to reset challenge" }),
        variant: "destructive",
      });
    }
    
    setShowResetDialog(false);
  };

  const handleResume = async () => {
    if (!user) return;
    try {
      await supabase
        .from("detox_challenges")
        .update({ status: "active" })
        .eq("id", challenge.id);
      toast({
      title: t("challenge_card.challenge_resumed"),
        description: jokers > 0
        ? t("challenge_card.lets_keep_going")
        : t("challenge_card.no_jokers_warning"),
      });
      onUpdate();
    } catch (error) {
      toast({
        title: t("common.error"),
        description: t("challenge_card.failed_resume", { defaultValue: "Failed to resume" }),
        variant: "destructive",
      });
    }
  };

  const togglePause = async () => {
    if (!user) return;
    const newStatus = challenge.status === "paused" ? "active" : "paused";
    try {
      await supabase
        .from("detox_challenges")
        .update({ status: newStatus })
        .eq("id", challenge.id);
      toast({
        title: newStatus === "paused" ? t("challenge_card.challenge_paused") : t("challenge_card.challenge_resumed"),
        description: newStatus === "paused"
          ? t("challenge_card.take_time")
          : t("challenge_card.lets_keep_going"),
      });
      onUpdate();
    } catch (error) {
      toast({
        title: t("common.error"),
        description: t("challenge_card.failed_update", { defaultValue: "Failed to update challenge" }),
        variant: "destructive",
      });
    }
  };

  const deleteChallenge = async () => {
    if (!user) return;
    
    try {
      await supabase
        .from("detox_challenges")
        .delete()
        .eq("id", challenge.id);
      
      toast({ title: t("challenge_card.challenge_removed"), description: t("challenge_card.challenge_deleted") });
      onUpdate();
    } catch (error) {
      toast({
        title: t("common.error"),
        description: t("challenge_card.failed_delete", { defaultValue: "Failed to delete challenge" }),
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className={`glass rounded-2xl overflow-hidden shadow-card ${
        isCompleted ? "ring-2 ring-accent/30" : ""
      }`}>
        {/* Streak header */}
        <div className={`px-4 py-3 flex items-center justify-between ${
          isCompleted ? "bg-accent/10" : "bg-accent/5"
        }`}>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Flame className={`h-5 w-5 ${currentDay > 0 ? "text-accent" : "text-muted-foreground"}`} />
              <span className="text-2xl font-bold text-foreground">{currentDay}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {isCompleted ? (
                <span className="text-accent font-medium">
                  {t("challenge_card.complete_excl")}
                </span>
              ) : (
                <>
                  {currentDay === 1
                    ? t("challenge_card.day_completed")
                    : t("challenge_card.days_completed")}
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {/* Jokers dots */}
            <div className="flex items-center gap-0.5 mr-1">
              {[0, 1, 2].map(i => (
                <div key={i} className={`w-2.5 h-2.5 rounded-full ${i < jokers ? "bg-accent" : "bg-muted-foreground/20"}`} />
              ))}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-60 hover:opacity-100">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {!isPausedByJokers && (
                  <DropdownMenuItem onClick={togglePause}>
                    {challenge.status === "paused" ? (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        {t("challenge_card.resume")}
                      </>
                    ) : (
                      <>
                        <Pause className="h-4 w-4 mr-2" />
                        {t("challenge_card.pause")}
                      </>
                    )}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => setShowResetDialog(true)}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t("challenge_card.reset")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={deleteChallenge} className="text-destructive focus:text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t("challenge_card.delete")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-foreground mb-1">{localized.title}</h3>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <span>
              {t("challenge_card.day_of", { current: currentDay, total: challenge.duration_days })}
            </span>
            {challenge.status === "paused" && (
              <span className="px-2 py-0.5 bg-muted rounded-full text-xs">
                {t("challenge_card.paused")}
              </span>
            )}
          </div>
          
          {/* Progress bar */}
          <div className="h-2 bg-muted rounded-full overflow-hidden mb-4">
            <div 
              className="h-full gradient-accent rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Paused by jokers */}
          {isPausedByJokers && (
            <div className="mb-4 p-4 rounded-xl bg-destructive/5 border border-destructive/20 text-center space-y-3">
              <div className="flex items-center justify-center gap-2">
                <ShieldAlert className="h-4 w-4 text-destructive" />
                <p className="text-sm font-medium text-foreground">
                  {t("challenge_card.all_jokers_used")}
                </p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t("challenge_card.paused_at_day", { day: currentDay })}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleResume}
                  className="flex-1 px-4 py-2.5 rounded-xl gradient-accent text-accent-foreground text-sm font-medium"
                >
                  {t("challenge_card.resume_detox")}
                </button>
                <button
                  onClick={() => setShowResetDialog(true)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-muted text-foreground text-sm font-medium"
                >
                  {t("challenge_card.reset_detox")}
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground/70">
                {t("challenge_card.resume_no_jokers")}
              </p>
            </div>
          )}
          
          {!isCompleted && challenge.status === "active" && (
            <button
              onClick={checkIn}
              disabled={checkedInToday || isLoading}
              className={`w-full py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                checkedInToday
                  ? "bg-muted text-muted-foreground"
                  : "gradient-accent text-accent-foreground active:scale-[0.98] shadow-soft"
              }`}
            >
              {checkedInToday ? (
                <>
                  <Check className="h-5 w-5" />
                  {t("challenge_card.checked_in_today")}
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5" />
                  {t("challenge_card.check_in_today")}
                </>
              )}
            </button>
          )}
          
          {!isCompleted && !checkedInToday && challenge.status === "active" && (
            <p className="text-center text-xs text-muted-foreground mt-3">
              {t("challenge_card.days_to_go", { days: daysLeft })}
            </p>
          )}
        </div>
      </div>

      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent className="rounded-2xl max-w-sm mx-4">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("challenge_card.start_fresh_title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("challenge_card.start_fresh_desc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">
              {t("challenge_card.keep_going")}
            </AlertDialogCancel>
            <AlertDialogAction onClick={resetChallenge} className="rounded-xl gradient-primary text-primary-foreground">
              {t("challenge_card.fresh_start")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
