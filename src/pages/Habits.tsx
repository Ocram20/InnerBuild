import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Search, Filter, Heart, Brain, Dumbbell, BookOpen, Users, Palette, Sparkles, Flame, X } from "lucide-react";
import HabitProgressCard from "@/components/HabitProgressCard";
import HabitTips from "@/components/HabitTips";
import CreateHabitModal from "@/components/CreateHabitModal";
import BottomNavigation from "@/components/BottomNavigation";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface Habit {
  id: string;
  title: string;
  description: string | null;
  frequency: string;
  category: string;
  is_active: boolean;
  completed_today?: boolean;
  streak?: number;
  weeklyProgress?: number;
}

export default function Habits() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const categories = [
    { id: "all", label: "Tutte", icon: Sparkles },
    { id: "health", label: "Salute", icon: Heart },
    { id: "productivity", label: "Produttività", icon: Sparkles },
    { id: "mindfulness", label: "Mindfulness", icon: Brain },
    { id: "fitness", label: "Fitness", icon: Dumbbell },
    { id: "learning", label: "Apprendimento", icon: BookOpen },
    { id: "social", label: "Sociale", icon: Users },
    { id: "creativity", label: "Creatività", icon: Palette },
    { id: "general", label: "Generale", icon: Flame },
  ];

  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  useEffect(() => {
    if (user) fetchHabits();
  }, [user]);

  const fetchHabits = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const today = new Date().toISOString().spli"T"[0];
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      const weekStart = startOfWeek.toISOString().spli"T"[0];

      const { data: habitsData, error: habitsError } = await supabase
        .from("habits").selec"*".eq("user_id", user.id).eq("is_active", true).order("created_at", { ascending: false });
      if (habitsError) throw habitsError;

      const { data: todayLogs } = await supabase.from("habit_logs").selec"habit_id".eq("user_id", user.id).eq("completed_at", today);
      const todayCompletedIds = new Set(todayLogs?.map(l => l.habit_id) || []);

      const { data: weeklyLogs } = await supabase.from("habit_logs").selec"habit_id, completed_at".eq("user_id", user.id).gte("completed_at", weekStart).lte("completed_at", today);
      const weeklyProgressMap: Record<string, number> = {};
      weeklyLogs?.forEach(log => { weeklyProgressMap[log.habit_id] = (weeklyProgressMap[log.habit_id] || 0) + 1; });

      const streakMap: Record<string, number> = {};
      if (habitsData) {
        for (const habit of habitsData) {
          let streak = 0;
          let checkDate = new Date();
          for (let i = 0; i < 30; i++) {
            const dateStr = checkDate.toISOString().spli"T"[0];
            const hasLog = weeklyLogs?.some(l => l.habit_id === habit.id && l.completed_at === dateStr);
            if (hasLog || (i === 0 && !todayCompletedIds.has(habit.id))) {
              if (hasLog) streak++;
              else if (i > 0) break;
            } else if (i > 0) break;
            checkDate.setDate(checkDate.getDate() - 1);
          }
          streakMap[habit.id] = streak;
        }
      }

      setHabits((habitsData || []).map(h => ({
        ...h, completed_today: todayCompletedIds.has(h.id), weeklyProgress: weeklyProgressMap[h.id] || 0, streak: streakMap[h.id] || 0,
      })));
    } catch (error) {
      console.error("Error fetching habits:", error);
      toast({ title: "Errore", description: "Failed to load habits", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const filteredHabits = useMemo(() => {
    return habits.filter(habit => {
      const matchesSearch = habit.title.toLowerCase().includes(searchQuery.toLowerCase()) || habit.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || habit.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [habits, searchQuery, selectedCategory]);

  const completedToday = habits.filter(h => h.completed_today).length;
  const totalHabits = habits.length;
  const progressPercent = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="flex items-center gap-3 p-4 max-w-lg mx-auto">
          <Button variant="ghost" size="icon" onClick={() => navigate("/explore")} className="rounded-full h-9 w-9">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="font-bold text-foreground">{"Le Mie Abitudini"}</h1>
            <p className="text-xs text-muted-foreground">
              {`${completedToday}/${totalHabits} completate oggi • ${progressPercent}%`}
            </p>
          </div>
          <Button size="sm" onClick={() => setShowCreateModal(true)} className="gradient-primary text-primary-foreground rounded-xl shadow-soft">
            <Plus className="h-4 w-4 mr-1" />
            {"Nuovo"}
          </Button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        <div className="animate-fade-in">
          <Dialog>
            <DialogTrigger asChild>
              <button className="w-full text-left glass rounded-2xl p-4 flex items-center justify-between hover:shadow-md transition">
                <div>
                  <p className="font-semibold">{"La Guida per Padroneggiare le Abitudini"}</p>
                  <p className="text-xs text-muted-foreground">{"Una guida concisa per costruire abitudini durature"}</p>
                </div>
                <div className="text-primary">{"Apri"}</div>
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[85vh] w-full overflow-y-auto sm:rounded-lg">
              <DialogTitle>{"Costruire Buone Abitudini"}</DialogTitle>
              <DialogDescription className="mt-2 text-sm space-y-4">
                <h3 className="font-medium">{"Introduzione"}</h3>
                <p>{"Le abitudini sono la base invisibile del successo. Non sono solo azioni ripetute; sono ciò che il nostro cervello automatizza per risparmiare energia. Migliorare dell'1% ogni giorno può portare a un cambiamento significativo a lungo termine."}</p>
                <p>{"Il segreto non è solo fissare obiettivi, ma creare un sistema di abitudini coerente con la persona che vuoi diventare."}</p>
                <h3 className="font-medium mt-4">{"Perché Concentrarsi sull'Identità"}</h3>
                <p>{"Molti falliscono nel cambiare non perché \"non gli importa abbastanza\", ma perché si concentrano solo sui risultati."}</p>
                <p>{"I tre livelli del cambiamento comportamentale sono: Risultati (cosa ottieni), Processi (cosa fai), Identità (cosa credi). Il vero cambiamento parte dall'identità — decidi chi vuoi essere, poi dimostralo a te stesso con piccole vittorie."}</p>
                <h3 className="font-medium mt-4">{"Comprendere le Abitudini"}</h3>
                <p>{"Ogni abitudine segue un ciclo chiamato loop di feedback:"}</p>
                <ul className="list-disc list-inside ml-4">
                  <li><strong>{"Segnale"}</strong> – {"ciò che innesca l'azione"}</li>
                  <li><strong>{"Desiderio"}</strong> – {"la motivazione per compiere l'azione"}</li>
                  <li><strong>{"Risposta"}</strong> – {"il comportamento stesso"}</li>
                  <li><strong>{"Ricompensa"}</strong> – {"la gratificazione immediata"}</li>
                </ul>
                <h3 className="font-medium mt-4">{"Le Quattro Leggi del Cambiamento Comportamentale"}</h3>
                <h4 className="font-medium mt-3">{"1ª Legge: Rendilo Ovvio"}</h4>
                <ul className="list-disc list-inside ml-4">
                  {(t("habits.guide_content.law1_items", { returnObjects: true }) as string[]).map((item: string, i: number) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
                <h4 className="font-medium mt-3">{"2ª Legge: Rendilo Attraente"}</h4>
                <ul className="list-disc list-inside ml-4">
                  {(t("habits.guide_content.law2_items", { returnObjects: true }) as string[]).map((item: string, i: number) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
                <h4 className="font-medium mt-3">{"3ª Legge: Rendilo Facile"}</h4>
                <ul className="list-disc list-inside ml-4">
                  {(t("habits.guide_content.law3_items", { returnObjects: true }) as string[]).map((item: string, i: number) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
                <h4 className="font-medium mt-3">{"4ª Legge: Rendilo Soddisfacente"}</h4>
                <ul className="list-disc list-inside ml-4">
                  {(t("habits.guide_content.law4_items", { returnObjects: true }) as string[]).map((item: string, i: number) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
                <h3 className="font-medium mt-4">{"Rompere le Cattive Abitudini"}</h3>
                <p>{"Inverti le quattro leggi:"}</p>
                <ul className="list-disc list-inside ml-4">
                  {(t("habits.guide_content.breaking_items", { returnObjects: true }) as string[]).map((item: string, i: number) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
                <h3 className="font-medium mt-4">{"Strategie Avanzate"}</h3>
                <ul className="list-disc list-inside ml-4">
                  {(t("habits.guide_content.advanced_items", { returnObjects: true }) as string[]).map((item: string, i: number) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
                <h3 className="font-medium mt-4">{"Pensiero Finale"}</h3>
                <p>{"Il successo non è un obiettivo da raggiungere. È un sistema da costruire."}</p>
                <p className="font-medium italic">{"Piccoli cambiamenti. Risultati straordinari. Un'abitudine alla volta."}</p>
              </DialogDescription>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative animate-fade-in">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={"Cerca abitudini..."} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 rounded-xl bg-muted/50 border-transparent focus:bg-background" />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full">
              <X className="h-3 w-3 text-muted-foreground" />
            </button>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none animate-fade-in" style={{ animationDelay: "50ms" }}>
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            return (
              <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${isActive ? "gradient-primary text-primary-foreground shadow-soft" : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                <Icon className="h-4 w-4" />
                {cat.label}
              </button>
            );
          })}
        </div>

        <div className="animate-fade-in" style={{ animationDelay: "100ms" }}>
          <HabitTips />
        </div>

        <div className="space-y-3 animate-fade-in" style={{ animationDelay: "150ms" }}>
          {loading ? (
            <LoadingSpinner className="py-12" />
          ) : filteredHabits.length === 0 ? (
            <div className="glass rounded-2xl p-8 text-center">
              {habits.length === 0 ? (
                <>
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{"Nessuna abitudine ancora"}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{"Inizia il tuo percorso creando la tua prima abitudine"}</p>
                  <Button onClick={() => setShowCreateModal(true)} className="gradient-primary text-primary-foreground rounded-xl shadow-soft">
                    <Plus className="h-4 w-4 mr-2" />
                    {"Crea Abitudine"}
                  </Button>
                </>
              ) : (
                <>
                  <Filter className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">{"Nessuna abitudine corrisponde ai filtri"}</p>
                  <button onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }} className="text-sm text-primary mt-2 hover:underline">
                    {"Rimuovi filtri"}
                  </button>
                </>
              )}
            </div>
          ) : (
            filteredHabits.map((habit) => (
              <HabitProgressCard key={habit.id} habit={habit} onUpdate={fetchHabits} onEdit={(h) => setEditingHabit(h)} />
            ))
          )}
        </div>
      </main>

      <CreateHabitModal open={showCreateModal} onOpenChange={setShowCreateModal} onSuccess={fetchHabits} />
      <BottomNavigation />
    </div>
  );
}
