import { useState, useEffect } from "react";
import { Heart, Plus, Trash2, Loader2, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const suggestedReasons = [] as string[]; // will be populated inside component

export function ReasonsSection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reasons, setReasons] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newReason, setNewReason] = useState("");

  const suggestedReasons = [
    "Migliore salute fisica e mentale",
    "Libertà da dipendenza e compulsione",
    "Relazioni più profonde e autentiche",
    "Più tempo ed energia per ciò che conta",
    "Maggiore concentrazione e produttività",
    "Controllo sulla mia vita e decisioni",
    "Migliore autostima e fiducia",
    "Essere presente con le persone che amo",
  ];

  useEffect(() => {
    if (user) {
      loadReasons();
    }
  }, [user]);

  const loadReasons = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("user_id", user.id)
        .eq("entry_date", "quit-reasons")
        .maybeSingle();

      if (data?.content) {
        try {
          const parsed = JSON.parse(data.content);
          setReasons(parsed);
        } catch {
          setReasons([]);
        }
      }
    } catch (error) {
      console.error("Error loading reasons:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveReasons = async (updatedReasons: string[]) => {
    if (!user) return;
    
    setSaving(true);
    try {
      const { data: existing } = await supabase
        .from("journal_entries")
        .select("id")
        .eq("user_id", user.id)
        .eq("entry_date", "quit-reasons")
        .maybeSingle();

      if (existing) {
        await supabase
          .from("journal_entries")
          .update({ content: JSON.stringify(updatedReasons) })
          .eq("id", existing.id);
      } else {
        await supabase
          .from("journal_entries")
          .insert({
            user_id: user.id,
            entry_date: "quit-reasons",
            content: JSON.stringify(updatedReasons),
          });
      }
      
      setReasons(updatedReasons);
    } catch (error) {
      toast({
        title: "Errore salvataggio",
        description: "Impossibile salvare i tuoi motivi. Per favore riprova.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const addReason = (reason: string) => {
    if (!reason.trim()) return;
    if (reasons.includes(reason.trim())) {
      toast({
        title: "Già aggiunto",
        description: "Questo motivo è già nella tua lista.",
      });
      return;
    }

    const updatedReasons = [...reasons, reason.trim()];
    saveReasons(updatedReasons);
    setNewReason("");
  };

  const removeReason = (index: number) => {
    const updatedReasons = reasons.filter((_, i) => i !== index);
    saveReasons(updatedReasons);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" />
          {"I miei motivi per smettere"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-sm">
          {"Le tue motivazioni personali sono il tuo ancoraggio. Leggile durante i desideri per ricordare perché hai iniziato."}
        </p>

        {/* User's reasons */}
        {reasons.length > 0 && (
          <div className="space-y-2">
            {reasons.map((reason, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20 group"
              >
                <Sparkles className="h-4 w-4 text-primary shrink-0" />
                <p className="text-sm text-foreground flex-1">{reason}</p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  onClick={() => removeReason(index)}
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Add custom reason */}
        <div className="space-y-2">
          <Textarea
            placeholder={"Scrivi il tuo motivo..."}
            value={newReason}
            onChange={(e) => setNewReason(e.target.value)}
            className="min-h-[60px] text-sm"
          />
          <Button 
            size="sm" 
            onClick={() => addReason(newReason)}
            disabled={saving || !newReason.trim()}
            className="w-full"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            {"Aggiungi il mio motivo"}
          </Button>
        </div>

        {/* Suggested reasons */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">{"Oppure tocca per aggiungere un motivo suggerito:"}</p>
          <div className="flex flex-wrap gap-2">
            {suggestedReasons
              .filter(r => !reasons.includes(r))
              .map((reason) => (
                <button
                  key={reason}
                  onClick={() => addReason(reason)}
                  className="text-xs px-3 py-1.5 rounded-full bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  {reason}
                </button>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
