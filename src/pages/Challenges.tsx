import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { usePremiumLimits, FREE_LIMITS } from "@/hooks/usePremiumLimits";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Flame, Smartphone, Brain, Shield, Sparkles, Trophy, Crown } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import ChallengeDetailCard from "@/components/ChallengeDetailCard";
import SuggestedChallengesList, { SuggestedChallenge } from "@/components/SuggestedChallenges";
import CreateChallengeModal from "@/components/CreateChallengeModal";
import PaywallModal from "@/components/PaywallModal";
import BottomNavigation from "@/components/BottomNavigation";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useTranslation } from "react-i18next";

interface Challenge {
  id: string; title: string; description: string | null; duration_days: number; start_date: string;
  current_streak: number; longest_streak: number; status: string; last_check_in: string | null;
  category: string; daily_steps: string[] | null; science_note: string | null;
}

export default function Challenges() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { isPremium, canCreateChallenge, challengesRemaining, refetch: refetchLimits } = usePremiumLimits();
  const navigate = useNavigate();
  const location = useLocation();
  const fromExplore = location.state?.from === "explore";
  const { toast } = useToast();
  const categories = [
    { id: "all", label: "Tutte", icon: Sparkles },
    { id: "digital_detox", label: "Detox Digitale", icon: Smartphone },
    { id: "mental_reset", label: "Reset Mentale", icon: Brain },
    { id: "porn_detox", label: "Recovery", icon: Shield },
  ];

  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSuggested, setSelectedSuggested] = useState<SuggestedChallenge | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => { if (user) fetchChallenges(); }, [user]);

  const fetchChallenges = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.from("detox_challenges").select("*").eq("user_id", user.id).in("status", ["active", "paused"]).order("created_at", { ascending: false });
      if (error) throw error;
      setChallenges(data || []);
    } catch (error) {
      console.error("Error fetching challenges:", error);
      toast({ title: "Errore", description: "Caricamento sfide fallito", variant: "destructive" });
    } finally { setLoading(false); }
  };

  const startSuggestedChallenge = async (suggested: SuggestedChallenge) => {
    if (!user) return;
    if (!canCreateChallenge) { setShowPaywall(true); return; }
    try {
      const today = new Date().toISOString().split("T")[0];
      const { error } = await supabase.from("detox_challenges").insert({
        user_id: user.id, title: suggested.title, description: suggested.description,
        duration_days: suggested.duration_days, category: suggested.category,
        daily_steps: suggested.daily_steps, science_note: suggested.science_note, start_date: today,
      });
      if (error) throw error;
      toast({ title: "Sfida iniziata! 🔥", description: `Il tuo percorso di ${suggested.duration_days} giorni inizia oggi!` });
      refetchLimits(); fetchChallenges();
    } catch (error) {
      console.error("Error starting challenge:", error);
      toast({ title: "Errore", description: "Avvio sfida fallito", variant: "destructive" });
    }
  };

  const activeChallenges = challenges.filter(c => selectedCategory === "all" || c.category === selectedCategory);
  const completedCount = challenges.filter(c => c.status === "completed").length;

  return (
    <div className="min-h-screen pb-24 bg-background">
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="flex items-center gap-3 p-4 max-w-lg mx-auto">
          <Button variant="ghost" size="icon" onClick={() => navigate(fromExplore ? "/explore" : "/dashboard")} className="rounded-full h-9 w-9">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="font-bold text-foreground">{"Sfide Detox"}</h1>
            <p className="text-xs text-muted-foreground">
              {`${challenges.length} attive • ${completedCount} completate`}
            </p>
          </div>
          <Button size="sm" onClick={() => setShowCreateModal(true)} className="gradient-accent text-accent-foreground rounded-xl shadow-soft">
            <Plus className="h-4 w-4 mr-1" />
            {"Personalizzato"}
          </Button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-4 space-y-5">
        <div className="animate-fade-in">
          <Dialog>
            <DialogTrigger asChild>
              <button className="w-full text-left glass rounded-2xl p-4 flex items-center justify-between hover:shadow-md transition">
                <div>
                  <p className="font-semibold">{"Come Padroneggiare l'Eliminazione delle Cattive Abitudini"}</p>
                  <p className="text-xs text-muted-foreground">{"Una guida per lasciar andare ciò che ti danneggia"}</p>
                </div>
                <div className="text-primary">{"Apri"}</div>
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[85vh] w-full overflow-y-auto sm:rounded-lg">
              <DialogTitle>{"Rompere le Cattive Abitudini"}</DialogTitle>
              <DialogDescription className="mt-2 text-sm space-y-4">
                <h3 className="font-medium">{"Introduzione"}</h3>
                <p>{"Rompere una cattiva abitudine non riguarda la forza di volontà — riguarda la strategia. Il tuo cervello ha automatizzato questi comportamenti, e l'unico modo per cambiarli è capire come funzionano e interrompere il pattern."}</p>
                <p>{"Questa guida ti aiuterà ad applicare la scienza del cambiamento comportamentale per eliminare le abitudini che non ti servono più."}</p>
                <h3 className="font-medium mt-4">{"Perché le Cattive Abitudini Persistono"}</h3>
                <p>{"Le cattive abitudini forniscono gratificazione immediata mentre le conseguenze sono ritardate. Il tuo cervello dà priorità alle ricompense istantanee, rendendo difficile resistere."}</p>
                <p>{"Comprendere il loop dell'abitudine (Segnale → Desiderio → Risposta → Ricompensa) è il primo passo per liberarsi."}</p>
                <h3 className="font-medium mt-4">{"La Strategia dell'Inversione"}</h3>
                <p>{"Per rompere una cattiva abitudine, inverti le quattro leggi del cambiamento comportamentale:"}</p>
                <h4 className="font-medium mt-3">{"Rendilo Invisibile"}</h4>
                <ul className="list-disc list-inside ml-4">
                  {(t("challenges.guide_content.inv1_items", { returnObjects: true }) as string[]).map((item: string, i: number) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
                <h4 className="font-medium mt-3">{"Rendilo Poco Attraente"}</h4>
                <ul className="list-disc list-inside ml-4">
                  {(t("challenges.guide_content.inv2_items", { returnObjects: true }) as string[]).map((item: string, i: number) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
                <h4 className="font-medium mt-3">{"Rendilo Difficile"}</h4>
                <ul className="list-disc list-inside ml-4">
                  {(t("challenges.guide_content.inv3_items", { returnObjects: true }) as string[]).map((item: string, i: number) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
                <h4 className="font-medium mt-3">{"Rendilo Insoddisfacente"}</h4>
                <ul className="list-disc list-inside ml-4">
                  {(t("challenges.guide_content.inv4_items", { returnObjects: true }) as string[]).map((item: string, i: number) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
                <h3 className="font-medium mt-4">{"Sostituisci, Non Solo Rimuovere"}</h3>
                <p>{"La strategia più efficace non è solo fermarsi — è sostituire. Quando senti l'impulso, reindirizza verso un'alternativa più sana che soddisfi lo stesso desiderio."}</p>
                <ul className="list-disc list-inside ml-4">
                  {(t("challenges.guide_content.replacement_items", { returnObjects: true }) as string[]).map((item: string, i: number) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
                <h3 className="font-medium mt-4">{"Il Cambio di Mentalità"}</h3>
                <p>{"Non concentrarti su ciò che stai rinunciando. Concentrati su ciò che stai guadagnando: libertà, chiarezza, rispetto di sé e una vita allineata ai tuoi valori."}</p>
                <p>{"Ogni momento di resistenza sta costruendo la persona che vuoi diventare."}</p>
                <h3 className="font-medium mt-4">{"Pensiero Finale"}</h3>
                <p>{"Non hai bisogno di essere perfetto. Hai bisogno di essere costante."}</p>
                <p className="font-medium italic">{"Rompi il pattern. Costruisci la vita che meriti."}</p>
              </DialogDescription>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none animate-fade-in">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            return (
              <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${isActive ? "gradient-accent text-accent-foreground shadow-soft" : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                <Icon className="h-4 w-4" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <LoadingSpinner className="py-12" />
        ) : (
          <>
            {activeChallenges.length > 0 && (
              <section className="animate-fade-in">
                <div className="flex items-center gap-2 mb-3">
                  <Flame className="h-5 w-5 text-accent" />
                  <h2 className="font-semibold text-foreground">{"Le Tue Sfide Attive"}</h2>
                </div>
                <div className="space-y-3">
                  {activeChallenges.map((challenge) => (
                    <ChallengeDetailCard key={challenge.id} challenge={challenge} onUpdate={fetchChallenges} />
                  ))}
                </div>
              </section>
            )}

            {!isPremium && !canCreateChallenge && (
              <div className="glass rounded-2xl p-4 border border-accent/20 bg-accent/5 animate-fade-in">
                <div className="flex items-center gap-2 mb-1">
                  <Crown className="h-4 w-4 text-accent" />
                  <p className="text-sm font-semibold text-foreground">{"Hai usato la tua sfida gratuita"}</p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{"Gli account gratuiti includono 1 sfida totale. Aggiorna a Premium per sbloccare sfide illimitate."}</p>
                <Button size="sm" onClick={() => setShowPaywall(true)} className="mt-3 gradient-accent text-accent-foreground rounded-xl text-xs">
                  {"Aggiorna a Premium"}
                </Button>
              </div>
            )}

            <section className="animate-fade-in" style={{ animationDelay: "100ms" }}>
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="h-5 w-5 text-xp" />
                <h2 className="font-semibold text-foreground">{"Esplora Sfide"}</h2>
              </div>
              <SuggestedChallengesList category={selectedCategory} onStartChallenge={startSuggestedChallenge} disabled={!isPremium && !canCreateChallenge} />
            </section>
          </>
        )}
      </main>

      <CreateChallengeModal open={showCreateModal} onOpenChange={setShowCreateModal} onSuccess={fetchChallenges} />
      <PaywallModal open={showPaywall} onOpenChange={setShowPaywall} reason="challenge_limit" />
      <BottomNavigation />
    </div>
  );
}
