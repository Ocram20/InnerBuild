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

interface Habit {
  id: string;
  title: string;
  description: string | null;
  frequency: string;
  category: string;
  reminder_time?: string | null;
}

interface EditHabitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  habitToEdit: Habit | null;
}

export default function EditHabitModal({ open, onOpenChange, onSuccess, habitToEdit }: EditHabitModalProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [anchor, setAnchor] = useState("");
  const [category, setCategory] = useState("general");
  const [frequency, setFrequency] = useState("daily");
  const [reminderTime, setReminderTime] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && habitToEdit) {
      setTitle(habitToEdit.title);
      
      const desc = habitToEdit.description || "";
      if (desc.startsWith("ANCHOR:")) {
        setAnchor(desc.replace("ANCHOR:", ""));
      } else {
        setAnchor(desc); // backwards compatibility
      }
      
      setCategory(habitToEdit.category || "general");
      setFrequency(habitToEdit.frequency || "daily");
      setReminderTime(habitToEdit.reminder_time || "");
    }
  }, [open, habitToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim() || !habitToEdit) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase.from("habits")
        .update({
          title: title.trim(),
          description: anchor.trim() ? `ANCHOR:${anchor.trim()}` : null,
          category,
          frequency,
          reminder_time: reminderTime || null,
        })
        .eq("id", habitToEdit.id)
        .eq("user_id", user.id);

      if (error) throw error;
      toast({ title: t("common.success", { defaultValue: "Success" }), description: t("habit_report.habit_updated_title", { defaultValue: "Habit updated! ✓" }) });
      onOpenChange(false);
      onSuccess();
    } catch {
      toast({ title: t("common.error"), description: t("create_habit.failed_create"), variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          onOpenChange(isOpen);
        }}
      >
        <DialogContent className="rounded-2xl max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              {t("common.edit")}
            </DialogTitle>
            <DialogDescription>
              {t("create_habit.description_placeholder")}
            </DialogDescription>
          </DialogHeader>



          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4 bg-muted/30 p-4 rounded-xl border border-border/50">
              <div className="space-y-2">
                <Label htmlFor="title">{t("create_habit.habit_name")}</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
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
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("common.save", { defaultValue: "Save" })}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

    </>
  );
}
