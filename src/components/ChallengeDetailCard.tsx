import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { 
  Flame, 
  MoreHorizontal, 
  Trash2, 
  RefreshCw, 
  Check, 
  Pause, 
  Play, 
  Zap,
  ChevronDown,
  ChevronUp,
  Clock,
  Lightbulb,
  Trophy,
  ShieldAlert
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
  category: string;
  daily_steps: string[] | null;
  science_note: string | null;
  jokers_remaining?: number;
}

interface ChallengeDetailCardProps {
  challenge: Challenge;
  onUpdate: () => void;
}

const categoryLabels: Record<string, string> = {
  digital_detox: "challenges.categories.digital_detox",
  mental_reset: "challenges.categories.mental_reset",
  porn_detox: "challenges.categories.porn_detox",
  general: "challenges.categories.general",
};

const categoryColors: Record<string, string> = {
  digital_detox: "text-level bg-level/10",
  mental_reset: "text-xp bg-xp/10",
  porn_detox: "text-accent bg-accent/10",
  general: "text-muted-foreground bg-muted",
};

export default function ChallengeDetailCard({ challenge, onUpdate }: ChallengeDetailCardProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const checkedInToday = challenge.last_check_in === today;
  // Day is based on check-in count, not calendar
  const currentDay = challenge.current_streak;
  const progressPercent = Math.min((currentDay / challenge.duration_days) * 100, 100);
  const isCompleted = currentDay >= challenge.duration_days;
  const daysLeft = challenge.duration_days - currentDay;
  const jokers = challenge.jokers_remaining ?? 3;
  const isPausedByJokers = challenge.status === "paused" && jokers <= 0;
  const localized = localizeSuggestedChallenge(t, {
    title: challenge.title,
    description: challenge.description,
    science_note: challenge.science_note,
    daily_steps: challenge.daily_steps,
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
      
      toast({
        title: t("challenge_card.challenge_removed"),
        description: t("challenge_card.challenge_deleted"),
      });
      
      onUpdate();
      setShowDeleteDialog(false);
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
        {/* Header with streak */}
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
                <span className="text-accent font-medium flex items-center gap-1">
                  <Trophy className="h-4 w-4" />
                  {t("challenge_card.complete_excl")}
                </span>
              ) : (
                <span>
                  {currentDay === 1
                    ? t("challenge_card.day_completed")
                    : t("challenge_card.days_completed")}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {/* Jokers indicator */}
            <div className="flex items-center gap-0.5 mr-1" title={`${jokers} joker${jokers !== 1 ? 's' : ''} remaining`}>
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    i < jokers ? "bg-accent" : "bg-muted-foreground/20"
                  }`}
                />
              ))}
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[challenge.category] || categoryColors.general}`}>
              {t(categoryLabels[challenge.category] || categoryLabels.general)}
            </span>
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
                <DropdownMenuItem 
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive focus:text-destructive"
                >
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
          
          {localized.description && (
            <p className="text-sm text-muted-foreground mb-3">{localized.description}</p>
          )}
          
          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {t("challenge_card.day_of", { current: currentDay, total: challenge.duration_days })}
            </span>
            {challenge.status === "paused" && (
                <span className="px-2 py-0.5 bg-muted rounded-full text-xs">
                  {t("challenge_card.paused")}
                </span>
            )}
          </div>
          
          {/* Progress bar */}
          <div className="mb-4">
            <Progress value={progressPercent} className="h-2" />
          </div>

          {/* Paused by jokers - Resume & Reset CTAs */}
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
                  className="flex-1 px-4 py-2.5 rounded-xl gradient-accent text-accent-foreground text-sm font-medium transition-all hover:opacity-90"
                >
                  {t("challenge_card.resume_detox")}
                </button>
                <button
                  onClick={() => setShowResetDialog(true)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-muted text-foreground text-sm font-medium transition-all hover:bg-muted/80"
                >
                  {t("challenge_card.reset_detox")}
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground/70">
                {t("challenge_card.resume_no_jokers")}
              </p>
            </div>
          )}
          
          {/* Check-in button */}
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
            <p className="text-center text-xs text-muted-foreground mt-2">
              {t("challenge_card.days_to_go", { days: daysLeft })}
            </p>
          )}

          {/* Enter Journey CTA */}
          <button
            onClick={() => navigate(`/challenges/${challenge.id}`)}
            className="w-full mt-3 py-2.5 rounded-xl bg-primary/5 hover:bg-primary/10 text-primary text-sm font-medium transition-all flex items-center justify-center gap-2"
          >
            {t("challenge_card.enter_journey")}
          </button>

          {/* Expandable details */}
          {(localized.science_note || (localized.daily_steps && localized.daily_steps.length > 0)) && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground mt-3 pt-3 border-t border-border/50 transition-colors"
            >
              {expanded ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  {t("challenge_card.hide_details")}
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  {t("challenge_card.view_steps_science")}
                </>
              )}
            </button>
          )}

          {expanded && (
            <div className="mt-3 space-y-3 animate-fade-in">
              {localized.science_note && (
                <div className="p-3 rounded-xl bg-xp/5 border border-xp/10">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="h-4 w-4 text-xp mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-xp mb-1">
                        {t("challenge_card.the_science")}
                      </p>
                      <p className="text-xs text-muted-foreground">{localized.science_note}</p>
                    </div>
                  </div>
                </div>
              )}

              {localized.daily_steps && localized.daily_steps.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-foreground">
                    {t("challenge_card.daily_steps")}
                  </p>
                  {localized.daily_steps.map((step, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0 text-[10px] font-medium">
                        {i + 1}
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Reset confirmation dialog */}
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

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="rounded-2xl max-w-sm mx-4">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">{t("challenge_card.delete_challenge_title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("challenge_card.delete_challenge_desc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">
              {t("common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction onClick={deleteChallenge} className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t("challenge_card.confirm_delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
