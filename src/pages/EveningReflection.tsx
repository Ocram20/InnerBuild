import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { untypedTable } from "@/integrations/supabase/untyped-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Moon, Heart, CheckCircle2, Loader2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { format } from "date-fns";
import { enUS, it as itLocale } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { EveningReflectionSection } from "@/components/daily-planning/EveningReflectionSection";
import BottomNavigation from "@/components/BottomNavigation";
const EveningReflectionPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const fromExplore = location.state?.from === "explore";
  const { toast } = useToast();
  const dateLocale = i18n.language === "it" ? itLocale : enUS;

  const moodOptions = [
    { value: "great", label: "Ottimo", emoji: "😊", color: "bg-green-500/20 text-green-600 border-green-500/30" },
    { value: "good", label: "Buono", emoji: "🙂", color: "bg-emerald-500/20 text-emerald-600 border-emerald-500/30" },
    { value: "okay", label: "Così così", emoji: "😐", color: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30" },
    { value: "struggling", label: "In difficoltà", emoji: "😔", color: "bg-orange-500/20 text-orange-600 border-orange-500/30" },
    { value: "difficult", label: "Difficile", emoji: "😣", color: "bg-red-500/20 text-red-600 border-red-500/30" },
  ];

  const [mood, setMood] = useState<string | null>(null);
  const [energyLevel, setEnergyLevel] = useState([5]);
  const [checkedIn, setCheckedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");

  useEffect(() => { if (user) loadTodayCheckIn(); }, [user]);

  const loadTodayCheckIn = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await untypedTable("daily_checkins").selec"mood, energy_level".eq("user_id", user.id).eq("checkin_date", todayStr).maybeSingle();
      if (error) throw error;
      if (data) { setMood(data.mood); setEnergyLevel([data.energy_level]); setCheckedIn(true); }
    } catch (error) { console.error("Error loading check-in:", error); }
    finally { setLoading(false); }
  };

  const handleCheckIn = async () => {
    if (!mood) { toast({ title: "Seleziona il tuo umore", description: "Seleziona come ti sei sentito oggi.", variant: "destructive" }); return; }
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await untypedTable("daily_checkins").upsert({ user_id: user.id, checkin_date: todayStr, mood, energy_level: energyLevel[0] }, { onConflict: "user_id,checkin_date" });
      if (error) throw error;
      setCheckedIn(true);
      toast({ title: "Check-in completato!", description: "Il tuo check-in giornaliero è stato salvato." });
    } catch (error) {
      console.error("Error saving check-in:", error);
      toast({ title: "Errore", description: "Salvataggio check-in fallito. Riprova.", variant: "destructive" });
    } finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-50 glass border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(fromExplore ? "/explore" : "/dashboard")} className="rounded-full"><ArrowLeft className="h-5 w-5" /></Button>
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2"><Moon className="h-5 w-5 text-primary" />{"Riflessione Serale"}</h1>
                <p className="text-sm text-muted-foreground">{format(today, "EEEE, MMMM d", { locale: dateLocale })}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6 max-w-4xl">
        <Card className="glass shadow-card animate-slide-up">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Heart className="h-5 w-5 text-rose-500" />
              {"Check-in Giornaliero"}
              {checkedIn && <Badge variant="secondary" className="ml-auto bg-green-500/20 text-green-600">{"Completato"}</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {loading ? (
              <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : (
              <>
                <div>
                  <p className="text-sm text-muted-foreground mb-3">{"Come ti sei sentito oggi?"}</p>
                  <div className="flex flex-wrap gap-2">
                    {moodOptions.map((option) => (
                      <button key={option.value} onClick={() => !checkedIn && setMood(option.value)} disabled={checkedIn}
                        className={`px-3 py-2 rounded-lg border transition-all ${mood === option.value ? option.color + " border-2" : "bg-muted/50 border-border hover:bg-muted"} ${checkedIn ? "cursor-default" : ""}`}>
                        <span className="mr-1.5">{option.emoji}</span><span className="text-sm">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-muted-foreground">{"Livello di energia oggi"}</p>
                    <Badge variant="outline" className="font-mono">{energyLevel[0]}/10</Badge>
                  </div>
                  <Slider value={energyLevel} onValueChange={!checkedIn ? setEnergyLevel : undefined} max={10} min={1} step={1} className="w-full" disabled={checkedIn} />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{"Poca energia"}</span><span>{"Molta energia"}</span>
                  </div>
                </div>
                {!checkedIn && (
                  <Button onClick={handleCheckIn} className="w-full" disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                    {"Completa Check-in"}
                  </Button>
                )}
              </>
            )}
          </CardContent>
        </Card>
        <EveningReflectionSection userId={user?.id} reflectionDate={format(today, "yyyy-MM-dd")} />
      </main>
      <BottomNavigation />
    </div>
  );
};

export default EveningReflectionPage;
