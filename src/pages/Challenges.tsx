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
    { id: "all", icon: Sparkles },
    { id: "digital_detox", icon: Smartphone },
    { id: "mental_reset", icon: Brain },
    { id: "porn_detox", icon: Shield },
  ] as const;

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
      toast({ title: t("common.error"), description: t("challenges.failed_load"), variant: "destructive" });
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
      toast({ title: t("challenges.challenge_started"), description: t("challenges.challenge_started_desc", { days: suggested.duration_days }) });
      refetchLimits(); fetchChallenges();
    } catch (error) {
      console.error("Error starting challenge:", error);
      toast({ title: t("common.error"), description: t("challenges.failed_start"), variant: "destructive" });
    }
  };

  const activeChallenges = challenges.filter(c => selectedCategory === "all" || c.category === selectedCategory);
  const completedCount = challenges.filter(c => c.status === "completed").length;

  return (
    <div className="min-h-screen pb-app-main bg-background">
      <header className="sticky top-0 safe-area-header z-50 glass border-b border-border/50">
        <div className="flex items-center gap-3 p-4 max-w-lg mx-auto">
          <Button variant="ghost" size="icon" onClick={() => navigate(fromExplore ? "/explore" : "/dashboard")} className="rounded-full h-9 w-9">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="font-bold text-foreground">{t("challenges.title")}</h1>
            <p className="text-xs text-muted-foreground">
              {t("challenges.active_completed", { active: challenges.length, completed: completedCount })}
            </p>
          </div>
          <Button size="sm" onClick={() => setShowCreateModal(true)} className="gradient-accent text-accent-foreground rounded-xl shadow-soft">
            <Plus className="h-4 w-4 mr-1" />
            {t("common.custom")}
          </Button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-4 space-y-5">
        <div className="animate-fade-in">
          <Dialog>
            <DialogTrigger asChild>
              <button className="w-full text-left glass rounded-2xl p-4 flex items-center justify-between hover:shadow-md transition">
                <div>
                  <p className="font-semibold">{t("challenges.guide_title")}</p>
                  <p className="text-xs text-muted-foreground">{t("challenges.guide_subtitle")}</p>
                </div>
                <div className="text-primary">{t("common.open")}</div>
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[85vh] w-full overflow-y-auto sm:rounded-lg">
              <DialogTitle>{t("challenges.guide_dialog_title")}</DialogTitle>
              <DialogDescription className="mt-2 text-sm space-y-4">
                <h3 className="font-medium">{t("challenges.guide_content.intro_title")}</h3>
                <p>{t("challenges.guide_content.intro_p1")}</p>
                <p>{t("challenges.guide_content.intro_p2")}</p>
                <h3 className="font-medium mt-4">{t("challenges.guide_content.why_title")}</h3>
                <p>{t("challenges.guide_content.why_p1")}</p>
                <p>{t("challenges.guide_content.why_p2")}</p>
                <h3 className="font-medium mt-4">{t("challenges.guide_content.inversion_title")}</h3>
                <p>{t("challenges.guide_content.inversion_intro")}</p>
                <h4 className="font-medium mt-3">{t("challenges.guide_content.inv1_title")}</h4>
                <ul className="list-disc list-inside ml-4">
                  {(t("challenges.guide_content.inv1_items", { returnObjects: true }) as string[]).map((item: string, i: number) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
                <h4 className="font-medium mt-3">{t("challenges.guide_content.inv2_title")}</h4>
                <ul className="list-disc list-inside ml-4">
                  {(t("challenges.guide_content.inv2_items", { returnObjects: true }) as string[]).map((item: string, i: number) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
                <h4 className="font-medium mt-3">{t("challenges.guide_content.inv3_title")}</h4>
                <ul className="list-disc list-inside ml-4">
                  {(t("challenges.guide_content.inv3_items", { returnObjects: true }) as string[]).map((item: string, i: number) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
                <h4 className="font-medium mt-3">{t("challenges.guide_content.inv4_title")}</h4>
                <ul className="list-disc list-inside ml-4">
                  {(t("challenges.guide_content.inv4_items", { returnObjects: true }) as string[]).map((item: string, i: number) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
                <h3 className="font-medium mt-4">{t("challenges.guide_content.replacement_title")}</h3>
                <p>{t("challenges.guide_content.replacement_p1")}</p>
                <ul className="list-disc list-inside ml-4">
                  {(t("challenges.guide_content.replacement_items", { returnObjects: true }) as string[]).map((item: string, i: number) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
                <h3 className="font-medium mt-4">{t("challenges.guide_content.mindset_title")}</h3>
                <p>{t("challenges.guide_content.mindset_p1")}</p>
                <p>{t("challenges.guide_content.mindset_p2")}</p>
                <h3 className="font-medium mt-4">{t("challenges.guide_content.final_title")}</h3>
                <p>{t("challenges.guide_content.final_p1")}</p>
                <p className="font-medium italic">{t("challenges.guide_content.final_p2")}</p>
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
                {t(`challenges.categories.${cat.id}`)}
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
                  <h2 className="font-semibold text-foreground">{t("challenges.your_active")}</h2>
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
                  <p className="text-sm font-semibold text-foreground">{t("challenges.free_used")}</p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{t("challenges.free_limit_desc")}</p>
                <Button size="sm" onClick={() => setShowPaywall(true)} className="mt-3 gradient-accent text-accent-foreground rounded-xl text-xs">
                  {t("challenges.upgrade_premium")}
                </Button>
              </div>
            )}

            <section className="animate-fade-in" style={{ animationDelay: "100ms" }}>
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="h-5 w-5 text-xp" />
                <h2 className="font-semibold text-foreground">{t("challenges.explore_challenges")}</h2>
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
