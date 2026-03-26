import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { usePremiumLimits, FREE_LIMITS } from "@/hooks/usePremiumLimits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles, Plus, X, Crown } from "lucide-react";
import PaywallModal from "@/components/PaywallModal";
import { useTranslation } from "react-i18next";

interface CreateChallengeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function CreateChallengeModal({ open, onOpenChange, onSuccess }: CreateChallengeModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { isPremium, canCreateChallenge, challengesRemaining, totalChallengeCount, refetch: refetchLimits } = usePremiumLimits();
  const { t } = useTranslation();

  const durationOptions = [
    { value: 3, label: t("create_challenge.durations.3_days"), description: t("create_challenge.durations.3_desc") },
    { value: 7, label: t("create_challenge.durations.7_days"), description: t("create_challenge.durations.7_desc") },
    { value: 21, label: t("create_challenge.durations.21_days"), description: t("create_challenge.durations.21_desc") },
    { value: 30, label: t("create_challenge.durations.30_days"), description: t("create_challenge.durations.30_desc") },
    { value: 90, label: t("create_challenge.durations.90_days"), description: t("create_challenge.durations.90_desc") },
  ];

  const categories = [
    { value: "digital_detox", label: t("challenges.categories.digital_detox") },
    { value: "mental_reset", label: t("challenges.categories.mental_reset") },
    { value: "porn_detox", label: t("challenges.categories.porn_detox") },
    { value: "general", label: t("habits.categories.general") },
  ];

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [duration, setDuration] = useState<number>(21);
  const [dailySteps, setDailySteps] = useState<string[]>([""]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => { if (open && !canCreateChallenge) setShowPaywall(true); }, [open, canCreateChallenge]);

  const addStep = () => { if (dailySteps.length < 7) setDailySteps([...dailySteps, ""]); };
  const removeStep = (index: number) => setDailySteps(dailySteps.filter((_, i) => i !== index));
  const updateStep = (index: number, value: string) => { const updated = [...dailySteps]; updated[index] = value; setDailySteps(updated); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim()) return;
    if (!canCreateChallenge) { setShowPaywall(true); return; }
    setIsLoading(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const filteredSteps = dailySteps.filter(s => s.trim());
      const { error } = await supabase.from("detox_challenges").insert({ user_id: user.id, title: title.trim(), description: description.trim() || null, duration_days: duration, category, daily_steps: filteredSteps.length > 0 ? filteredSteps : null, start_date: today });
      if (error) throw error;
      // Increment lifetime challenge counter for free tier limit
      await supabase.from("profiles").update({ total_challenges_created: totalChallengeCount + 1 } as any).eq("user_id", user.id);
      toast({ title: t("create_challenge.challenge_started"), description: t("create_challenge.challenge_started_desc", { days: duration }) });
      resetForm(); refetchLimits(); onOpenChange(false); onSuccess();
    } catch (error) {
      console.error("Error creating challenge:", error);
      toast({ title: t("common.error"), description: t("create_challenge.failed_create"), variant: "destructive" });
    } finally { setIsLoading(false); }
  };

  const resetForm = () => { setTitle(""); setDescription(""); setCategory("general"); setDuration(21); setDailySteps([""]); };

  return (
    <>
      <Dialog open={open && !showPaywall} onOpenChange={(isOpen) => { if (!isOpen) resetForm(); onOpenChange(isOpen); }}>
        <DialogContent className="rounded-2xl max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-accent" />{t("create_challenge.title")}</DialogTitle>
          </DialogHeader>
          
          {!isPremium && (
            <div className="p-3 rounded-xl bg-muted/50 border border-border/50 space-y-1">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-accent" />
                <span className="text-sm text-muted-foreground">
                  {challengesRemaining === 0 ? t("create_challenge.free_challenge_used") : t("create_challenge.free_challenge_available", { remaining: challengesRemaining })}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground/70 leading-relaxed">{t("create_challenge.free_limit_note")}</p>
            </div>
          )}
        
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">{t("create_challenge.challenge_name")}</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("create_challenge.challenge_placeholder")} className="rounded-xl" required maxLength={100} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="category">{t("create_challenge.category")}</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>{categories.map((cat) => (<SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">{t("create_challenge.duration")}</Label>
                <Select value={duration.toString()} onValueChange={(v) => setDuration(parseInt(v))}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>{durationOptions.map((opt) => (<SelectItem key={opt.value} value={opt.value.toString()}>{opt.label}</SelectItem>))}</SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">{t("create_challenge.description")}</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t("create_challenge.description_placeholder")} className="rounded-xl resize-none" rows={2} maxLength={500} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>{t("create_challenge.daily_steps")}</Label>
                {dailySteps.length < 7 && (
                  <button type="button" onClick={addStep} className="text-xs text-primary hover:underline flex items-center gap-1">
                    <Plus className="h-3 w-3" />{t("common.add_step")}
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {dailySteps.map((step, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium flex-shrink-0">{index + 1}</span>
                    <Input value={step} onChange={(e) => updateStep(index, e.target.value)} placeholder={`${t("common.step")} ${index + 1}...`} className="rounded-xl flex-1" maxLength={200} />
                    {dailySteps.length > 1 && (
                      <button type="button" onClick={() => removeStep(index)} className="p-1 hover:bg-muted rounded-full transition-colors"><X className="h-4 w-4 text-muted-foreground" /></button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1 rounded-xl">{t("common.cancel")}</Button>
              <Button type="submit" disabled={!title.trim() || isLoading} className="flex-1 gradient-accent text-accent-foreground rounded-xl shadow-soft">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("create_challenge.start_challenge")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <PaywallModal open={showPaywall} onOpenChange={(isOpen) => { setShowPaywall(isOpen); if (!isOpen && !canCreateChallenge) onOpenChange(false); }} reason="challenge_limit" />
    </>
  );
}
