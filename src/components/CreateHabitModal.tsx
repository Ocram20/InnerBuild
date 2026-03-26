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
import { Loader2, Sparkles, Crown } from "lucide-react";
import SuggestedHabits from "@/components/SuggestedHabits";
import PaywallModal from "@/components/PaywallModal";
interface CreateHabitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function CreateHabitModal({ open, onOpenChange, onSuccess }: CreateHabitModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { isPremium, canCreateHabit, habitsRemaining, refetch: refetchLimits } = usePremiumLimits();
  const categories = [
    { value: "health", label: "Salute" },
    { value: "productivity", label: "Produttività" },
    { value: "mindfulness", label: "Mindfulness" },
    { value: "fitness", label: "Fitness" },
    { value: "learning", label: "Apprendimento" },
    { value: "social", label: "Sociale" },
    { value: "creativity", label: "Creatività" },
    { value: "general", label: "Generale" },
  ];

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [frequency, setFrequency] = useState("daily");
  const [reminderTime, setReminderTime] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => { if (open && !canCreateHabit) setShowPaywall(true); }, [open, canCreateHabit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim()) return;
    if (!canCreateHabit) { setShowPaywall(true); return; }
    setIsLoading(true);
    try {
      const { error } = await supabase.from("habits").insert({ user_id: user.id, title: title.trim(), description: description.trim() || null, category, frequency, reminder_time: reminderTime || null });
      if (error) throw error;
      toast({ title: "Abitudine creata! 🎉", description: "Inizia a costruire la tua nuova abitudine oggi!" });
      resetForm(); refetchLimits(); onOpenChange(false); onSuccess();
    } catch (error) {
      toast({ title: "Errore", description: "Creazione abitudine fallita", variant: "destructive" });
    } finally { setIsLoading(false); }
  };

  const resetForm = () => { setTitle(""); setDescription(""); setCategory("general"); setFrequency("daily"); setReminderTime(""); setShowSuggestions(true); };

  const handleSelectSuggestion = (suggestion: { title: string; description: string; category: string; frequency: string }) => {
    setTitle(suggestion.title); setDescription(suggestion.description); setCategory(suggestion.category); setFrequency(suggestion.frequency); setShowSuggestions(false);
  };

  return (
    <>
      <Dialog open={open && !showPaywall} onOpenChange={(isOpen) => { if (!isOpen) resetForm(); onOpenChange(isOpen); }}>
        <DialogContent className="rounded-2xl max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" />{"Crea Nuova Abitudine"}</DialogTitle>
          </DialogHeader>
          
          {!isPremium && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border/50">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-accent" />
                <span className="text-sm text-muted-foreground">
                  {habitsRemaining === 0 ? "Limite abitudini raggiunto" : `${habitsRemaining} di ${FREE_LIMITS.MAX_HABITS} abitudini rimanenti`}
                </span>
              </div>
            </div>
          )}
          
          {showSuggestions && !title && (
            <div className="border-b border-border pb-4 mb-4"><SuggestedHabits onSelect={handleSelectSuggestion} /></div>
          )}
        
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">{"Nome abitudine *"}</Label>
              <Input id="title" value={title} onChange={(e) => { setTitle(e.target.value); if (e.target.value) setShowSuggestions(false); }} placeholder={"es., Meditazione mattutina"} className="rounded-xl" required maxLength={100} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">{"Descrizione (opzionale)"}</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={"Cosa significa questa abitudine per te?"} className="rounded-xl resize-none" rows={2} maxLength={500} />
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
                <Label htmlFor="frequency">{"Frequenza"}</Label>
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">{"Giornaliera"}</SelectItem>
                    <SelectItem value="weekly">{"Settimanale"}</SelectItem>
                    <SelectItem value="weekdays">{"Giorni feriali"}</SelectItem>
                    <SelectItem value="weekends">{"Weekend"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reminder">{"Promemoria (opzionale)"}</Label>
              <Input id="reminder" type="time" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} className="rounded-xl" />
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1 rounded-xl">{"Annulla"}</Button>
              <Button type="submit" disabled={!title.trim() || isLoading} className="flex-1 gradient-primary text-primary-foreground rounded-xl shadow-soft">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Crea Abitudine"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <PaywallModal open={showPaywall} onOpenChange={(isOpen) => { setShowPaywall(isOpen); if (!isOpen && !canCreateHabit) onOpenChange(false); }} reason="habit_limit" />
    </>
  );
}
