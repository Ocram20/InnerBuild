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
interface CreateChallengeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function CreateChallengeModal({ open, onOpenChange, onSuccess }: CreateChallengeModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { isPremium, canCreateChallenge, challengesRemaining, totalChallengeCount, refetch: refetchLimits } = usePremiumLimits();
  const durationOptions = [
    { value: 3, label: "3 Giorni", description: "Reset veloce" },
    { value: 7, label: "7 Giorni", description: "Sfida di una settimana" },
    { value: 21, label: "21 Giorni", description: "Formazione abitudine" },
    { value: 30, label: "30 Giorni", description: "Sfida mensile" },
    { value: 90, label: "90 Giorni", description: "Trasformazione profonda" },
  ];

  const categories = [
    { value: "digital_detox", label: "Detox Digitale" },
    { value: "mental_reset", label: "Reset Mentale" },
    { value: "porn_detox", label: "Recovery" },
    { value: "general", label: "Generale" },
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
      const today = new Date().toISOString().spli"T"[0];
      const filteredSteps = dailySteps.filter(s => s.trim());
      const { error } = await supabase.from("detox_challenges").insert({ user_id: user.id, title: title.trim(), description: description.trim() || null, duration_days: duration, category, daily_steps: filteredSteps.length > 0 ? filteredSteps : null, start_date: today });
      if (error) throw error;
      // Increment lifetime challenge counter for free tier limit
      await supabase.from("profiles").update({ total_challenges_created: totalChallengeCount + 1 } as any).eq("user_id", user.id);
      toast({ title: "Sfida iniziata! 🔥", description: `La tua sfida di ${duration} giorni inizia oggi. Ce la farai!` });
      resetForm(); refetchLimits(); onOpenChange(false); onSuccess();
    } catch (error) {
      console.error("Error creating challenge:", error);
      toast({ title: "Errore", description: "Creazione sfida fallita", variant: "destructive" });
    } finally { setIsLoading(false); }
  };

  const resetForm = () => { setTitle(""); setDescription(""); setCategory("general"); setDuration(21); setDailySteps([""]); };

  return (
    <>
      <Dialog open={open && !showPaywall} onOpenChange={(isOpen) => { if (!isOpen) resetForm(); onOpenChange(isOpen); }}>
        <DialogContent className="rounded-2xl max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-accent" />{"Crea Sfida Personalizzata"}</DialogTitle>
          </DialogHeader>
          
          {!isPremium && (
            <div className="p-3 rounded-xl bg-muted/50 border border-border/50 space-y-1">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-accent" />
                <span className="text-sm text-muted-foreground">
                  {challengesRemaining === 0 ? "Hai usato la tua sfida gratuita" : `${challengesRemaining} sfida gratuita disponibile`}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground/70 leading-relaxed">{"Gli account gratuiti hanno 1 sfida totale. Una volta usata, avrai bisogno del Premium per crearne altre — anche se la elimini o la completi."}</p>
            </div>
          )}
        
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">{"Nome sfida *"}</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={"es., Detox social media"} className="rounded-xl" required maxLength={100} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="category">{"Categoria"}</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>{categories.map((cat) => (<SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">{"Durata"}</Label>
                <Select value={duration.toString()} onValueChange={(v) => setDuration(parseInt(v))}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>{durationOptions.map((opt) => (<SelectItem key={opt.value} value={opt.value.toString()}>{opt.label}</SelectItem>))}</SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">{"Descrizione (opzionale)"}</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={"A cosa stai rinunciando? Perché è importante per te?"} className="rounded-xl resize-none" rows={2} maxLength={500} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>{"Passi Giornalieri (opzionale)"}</Label>
                {dailySteps.length < 7 && (
                  <button type="button" onClick={addStep} className="text-xs text-primary hover:underline flex items-center gap-1">
                    <Plus className="h-3 w-3" />{"Aggiungi passo"}
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {dailySteps.map((step, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium flex-shrink-0">{index + 1}</span>
                    <Input value={step} onChange={(e) => updateStep(index, e.target.value)} placeholder={`${"Passo"} ${index + 1}...`} className="rounded-xl flex-1" maxLength={200} />
                    {dailySteps.length > 1 && (
                      <button type="button" onClick={() => removeStep(index)} className="p-1 hover:bg-muted rounded-full transition-colors"><X className="h-4 w-4 text-muted-foreground" /></button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1 rounded-xl">{"Annulla"}</Button>
              <Button type="submit" disabled={!title.trim() || isLoading} className="flex-1 gradient-accent text-accent-foreground rounded-xl shadow-soft">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Inizia Sfida"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <PaywallModal open={showPaywall} onOpenChange={(isOpen) => { setShowPaywall(isOpen); if (!isOpen && !canCreateChallenge) onOpenChange(false); }} reason="challenge_limit" />
    </>
  );
}
