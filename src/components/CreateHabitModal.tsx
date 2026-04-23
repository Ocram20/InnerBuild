import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { usePremiumLimits, FREE_LIMITS } from "@/hooks/usePremiumLimits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles, Crown } from "lucide-react";
import SuggestedHabits from "@/components/SuggestedHabits";
import PaywallModal from "@/components/PaywallModal";

const HABIT_CATEGORY_VALUES = [
  "health",
  "productivity",
  "mindfulness",
  "fitness",
  "learning",
  "social",
  "creativity",
  "general",
] as const;

const FREQUENCY_VALUES = ["daily", "weekly", "weekdays", "weekends"] as const;

interface CreateHabitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function CreateHabitModal({ open, onOpenChange, onSuccess }: CreateHabitModalProps) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const { isPremium, canCreateHabit, habitsRemaining, refetch: refetchLimits } = usePremiumLimits();

  const [title, setTitle] = useState("");
  const [anchor, setAnchor] = useState("");
  const [category, setCategory] = useState("general");
  const [frequency, setFrequency] = useState("daily");
  const [reminderTime, setReminderTime] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    if (open && !canCreateHabit) setShowPaywall(true);
  }, [open, canCreateHabit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim()) return;
    if (!canCreateHabit) {
      setShowPaywall(true);
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.from("habits").insert({
        user_id: user.id,
        title: title.trim(),
        description: anchor.trim() ? `ANCHOR:${anchor.trim()}` : null,
        category,
        frequency,
        reminder_time: reminderTime || null,
        original_language: i18n.resolvedLanguage || i18n.language || "en",
      });
      if (error) throw error;
      toast({ title: t("create_habit.habit_created"), description: t("create_habit.habit_created_desc") });
      resetForm();
      refetchLimits();
      onOpenChange(false);
      onSuccess();
    } catch {
      toast({ title: t("common.error"), description: t("create_habit.failed_create"), variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setAnchor("");
    setCategory("general");
    setFrequency("daily");
    setReminderTime("");
    setShowSuggestions(true);
  };

  const handleSelectSuggestion = (suggestion: { title: string; description: string; category: string; frequency: string }) => {
    setTitle(suggestion.title);
    setAnchor(suggestion.description || "");
    setCategory(suggestion.category);
    setFrequency(suggestion.frequency);
    setShowSuggestions(false);
  };

  return (
    <>
      <Dialog
        open={open && !showPaywall}
        onOpenChange={(isOpen) => {
          if (!isOpen) resetForm();
          onOpenChange(isOpen);
        }}
      >
        <DialogContent className="rounded-2xl max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              {t("create_habit.title")}
            </DialogTitle>
            <DialogDescription>
              {t("create_habit.description_placeholder")}
            </DialogDescription>
          </DialogHeader>

          {!isPremium && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border/50">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-accent" />
                <span className="text-sm text-muted-foreground">
                  {habitsRemaining === 0
                    ? t("create_habit.habit_limit_reached")
                    : t("create_habit.habits_remaining", { remaining: habitsRemaining, max: FREE_LIMITS.MAX_HABITS })}
                </span>
              </div>
            </div>
          )}

          {showSuggestions && !title && (
            <div className="border-b border-border pb-4 mb-4">
              <SuggestedHabits onSelect={handleSelectSuggestion} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4 bg-muted/30 p-4 rounded-xl border border-border/50">
              <div className="space-y-2">
                <Label htmlFor="title">{t("create_habit.habit_name")}</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (e.target.value) setShowSuggestions(false);
                  }}
                  placeholder={t("create_habit.habit_placeholder")}
                  className="rounded-xl flex-1 bg-background"
                  required
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="anchor">{t("create_habit.anchor_label", { defaultValue: "Azione Ancora (Cosa fai già?)" })}</Label>
                <div className="flex items-center gap-2">
                   <span className="text-sm font-medium text-muted-foreground whitespace-nowrap bg-background px-3 py-2 rounded-xl border border-border">
                     {t("create_habit.after_i", { defaultValue: "Dopo che ho" })}...
                   </span>
                   <Input
                     id="anchor"
                     value={anchor}
                     onChange={(e) => setAnchor(e.target.value)}
                     placeholder={t("create_habit.anchor_placeholder", { defaultValue: "es. fatto il caffè" })}
                     className="rounded-xl flex-1 bg-background"
                   />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("create_habit.anchor_hint", { defaultValue: "Opzionale. Es: Dopo che ho fatto il caffè, mi dedicherò a questa abitudine." })}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="category">{t("create_habit.category")}</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HABIT_CATEGORY_VALUES.map((val) => (
                      <SelectItem key={val} value={val}>
                        {t(`habits.categories.${val}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="frequency">{t("create_habit.frequency")}</Label>
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FREQUENCY_VALUES.map((freq) => (
                      <SelectItem key={freq} value={freq}>
                        {t(`create_habit.frequencies.${freq}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reminderTime">{t("create_habit.reminder_time", { defaultValue: "Ora Specifica (Opzionale)" })}</Label>
              <Input
                id="reminderTime"
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1 rounded-xl">
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={!title.trim() || isLoading}
                className="flex-1 gradient-primary text-primary-foreground rounded-xl shadow-soft"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("habits.create_habit")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <PaywallModal
        open={showPaywall}
        onOpenChange={(isOpen) => {
          setShowPaywall(isOpen);
          if (!isOpen && !canCreateHabit) onOpenChange(false);
        }}
        reason="habit_limit"
      />
    </>
  );
}
