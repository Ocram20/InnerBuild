import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useTheme } from "next-themes";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { usePremiumLimits } from "@/hooks/usePremiumLimits";
import { useRecoveryJourney } from "@/hooks/useRecoveryJourney";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import LanguageSelector from "@/components/LanguageSelector";
import { useCategoryPreferences } from "@/hooks/useCategoryPreferences";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
  Leaf, LogOut, Moon, Sun, Crown, Plus,
  ChevronRight, Target, User, Compass, Home, AlertTriangle, Flame, X,
} from "lucide-react";
import CreateHabitModal from "@/components/CreateHabitModal";
import CreateChallengeModal from "@/components/CreateChallengeModal";
import TodayOverview from "@/components/TodayOverview";
import PaywallModal from "@/components/PaywallModal";
import DailyQuote from "@/components/DailyQuote";
import BottomNavigation from "@/components/BottomNavigation";
import ActiveChallengesCard from "@/components/ActiveChallengesCard";
import RecoveryStreakCard from "@/components/RecoveryStreakCard";
import HabitReportCard from "@/components/HabitReportCard";
import QuickAccessTodos from "@/components/QuickAccessTodos";
import LoadingSpinner from "@/components/LoadingSpinner";
import { EmergencyUrgeModal } from "@/components/recovery/EmergencyUrgeModal";
import { useTranslation } from "react-i18next";

interface Habit {
  id: string;
  title: string;
  description: string | null;
  frequency: string;
  is_active: boolean;
  completed_today?: boolean;
}

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const { user, signOut } = useAuth();
  const { subscription, openPortal } = useSubscription();
  const { isPremium } = usePremiumLimits();
  const { journey, checkIns, hasCheckedInToday, checkIn } = useRecoveryJourney();
  const { preferences, loading: prefsLoading } = useCategoryPreferences();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [habits, setHabits] = useState<Habit[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme, setTheme } = useTheme();
  const [firstName, setFirstName] = useState<string | null>(null);
  const [showCreateHabit, setShowCreateHabit] = useState(false);
  const [showCreateChallenge, setShowCreateChallenge] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [paywallReason, setPaywallReason] = useState<"ai_coach" | "recovery" | "general">("general");
  const [fabMenuOpen, setFabMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchData();
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase.from("profiles").select("first_name").eq("user_id", user.id).single();
    if (data?.first_name) setFirstName(data.first_name);
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && user && !showEmergency) fetchDataSilently();
    };
    const handleFocus = () => { if (user && !showEmergency) fetchDataSilently(); };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [user, showEmergency]);

  const fetchData = async (silent = false) => {
    if (!user) return;
    if (!silent) setLoading(true);
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      const { data: habitsData } = await supabase.from("habits").select("*").eq("user_id", user.id).eq("is_active", true).order("created_at", { ascending: false });
      const { data: logsData } = await supabase.from("habit_logs").select("habit_id").eq("user_id", user.id).eq("completed_at", today);
      const completedIds = new Set(logsData?.map(l => l.habit_id) || []);
      setHabits((habitsData || []).map(h => ({ ...h, completed_today: completedIds.has(h.id) })));
      const { data: challengesData } = await supabase.from("detox_challenges").select("*").eq("user_id", user.id).eq("status", "active").order("created_at", { ascending: false }).limit(3);
      setChallenges(challengesData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const fetchDataSilently = () => fetchData(true);
  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");
  const isDark = theme === "dark";

  const handleSignOut = async () => { await signOut(); navigate("/"); };

  const handleManageSubscription = async () => {
    try {
      await openPortal();
    } catch {
      toast({ title: t("common.error"), description: t("dashboard.failed_subscription"), variant: "destructive" });
    }
  };

  const toggleHabit = async (habitId: string) => {
    if (!user) return;
    const today = format(new Date(), "yyyy-MM-dd");
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;
    setHabits(prev => prev.map(h => h.id === habitId ? { ...h, completed_today: !h.completed_today } : h));
    try {
      if (habit.completed_today) {
        const { error } = await supabase.from("habit_logs").delete().eq("habit_id", habitId).eq("user_id", user.id).eq("completed_at", today);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("habit_logs").insert({ habit_id: habitId, user_id: user.id, completed_at: today });
        if (error) throw error;
      }
    } catch (error) {
      setHabits(prev => prev.map(h => h.id === habitId ? { ...h, completed_today: habit.completed_today } : h));
      toast({ title: t("common.error"), description: t("dashboard.failed_update_habit"), variant: "destructive" });
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    const greetingKey =
      hour < 12 ? "dashboard.good_morning" : hour < 18 ? "dashboard.good_afternoon" : "dashboard.good_evening";
    const greeting = t(greetingKey);
    if (firstName) {
      return (
        <>
          {greeting}, <span className="notranslate">{firstName}</span>
        </>
      );
    }
    return greeting;
  };

  const completedCount = habits.filter(h => h.completed_today).length;
  const totalHabits = habits.length;
  const progressPercent = totalHabits > 0 ? Math.round((completedCount / totalHabits) * 100) : 0;

  const SectionTitle = ({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) => (
    <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <h2 className="text-base font-semibold text-foreground">{children}</h2>
      {action}
    </div>
  );

  return (
    <div className="min-h-screen overflow-x-hidden pb-app-main bg-[#F8FAFC] dark:bg-[#0f1419] relative">
      {/* Background blur circles for dark mode */}
      <div className="hidden dark:block bg-blur-circle bg-[#4b9b75] -top-20 -left-20" />
      <div className="hidden dark:block bg-blur-circle bg-[#8b5cf6] top-1/2 -right-20" />
      <header className="sticky top-0 safe-area-header z-50 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="flex max-w-lg flex-col gap-3 p-4 mx-auto sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Leaf className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-foreground break-words">{getGreeting()}</h1>
              <p className="text-xs text-muted-foreground break-words">
                {new Date().toLocaleDateString(i18n.language || "it", { weekday: "long", day: "numeric", month: "long" })}
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center justify-end gap-1 self-end sm:self-auto">
            {subscription.subscribed && (
              <button onClick={handleManageSubscription} className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center gap-1 hover:bg-primary/20 transition-colors">
                <Crown className="h-3 w-3" />
                {t("common.pro")}
              </button>
            )}
            <LanguageSelector />
            <Button variant="ghost" size="icon" onClick={() => navigate("/?no_redirect=true")} className="rounded-full h-9 w-9" title={t("common.view_site")}>
              <Home className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate("/profile")} className="rounded-full h-9 w-9">
              <User className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full h-9 w-9">
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
                  <LogOut className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("dashboard.logout_confirm_title")}</AlertDialogTitle>
                  <AlertDialogDescription>{t("dashboard.logout_confirm_desc")}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSignOut}>{t("auth.sign_out")}</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-6 space-y-5">
        {loading || prefsLoading ? (
          <LoadingSpinner className="py-20" />
        ) : (
          <>
            <section className="animate-fade-in"><DailyQuote /></section>

            {preferences.habits && (
              <section className="animate-fade-in" style={{ animationDelay: "25ms" }}><HabitReportCard /></section>
            )}

            {preferences["daily-planning"] && (
              <section className="animate-fade-in" style={{ animationDelay: "50ms" }}><QuickAccessTodos userId={user?.id} /></section>
            )}

            {preferences.habits && (
              <section className="animate-fade-in" style={{ animationDelay: "100ms" }}>
                <SectionTitle
                  action={
                    <div className="flex flex-wrap items-center gap-2">
                      <Button size="sm" variant="ghost" onClick={() => navigate("/habits")} className="h-8 text-muted-foreground">
                        <Target className="h-4 w-4 mr-1" />
                        {t("common.all")}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setShowCreateHabit(true)} className="h-8 w-9 bg-[#4b9b75] text-white border-none btn-shadow">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  }
                >
                  {t("dashboard.todays_habits")}
                </SectionTitle>
                <p className="text-sm text-muted-foreground -mt-2 mb-3">
                  {t("dashboard.completed_stats", { completed: completedCount, total: totalHabits, percent: progressPercent })}
                </p>
                <TodayOverview habits={habits} onToggleHabit={toggleHabit} />
              </section>
            )}

            {preferences["the-forge"] && journey && (
              <section className="animate-fade-in" style={{ animationDelay: "150ms" }}>
                <RecoveryStreakCard journey={journey} checkIns={checkIns} hasCheckedInToday={hasCheckedInToday} onCheckIn={checkIn} />
                <Button type="button" variant="destructive" onClick={() => setShowEmergency(true)} className="w-full mt-3 gap-2 bg-[#ff4757] hover:bg-[#ff4757] text-white shadow-lg shadow-red-500/20 rounded-2xl h-12 text-[15px] font-extrabold uppercase tracking-wider active:scale-[0.98] transition-all">
                  <AlertTriangle className="h-4 w-4" />
                  {t("dashboard.emergency_urge")}
                </Button>
              </section>
            )}

            {preferences.challenges && (
              <section className="animate-fade-in" style={{ animationDelay: "200ms" }}>
                <ActiveChallengesCard challenges={challenges} />
              </section>
            )}

            <section className="animate-fade-in" style={{ animationDelay: "250ms" }}>
              <button onClick={() => navigate("/explore")} className="w-full rounded-2xl border border-border/60 bg-card p-4 flex items-center gap-4 hover:bg-muted/50 hover:border-primary/30 transition-all shadow-elevated card-elevated card-alt">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shadow-soft">
                  <Compass className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-base font-semibold text-foreground">{t("dashboard.explore_tools")}</p>
                  <p className="text-xs text-muted-foreground">{t("dashboard.explore_tools_desc")}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            </section>
          </>
        )}
      </main>

      <CreateHabitModal open={showCreateHabit} onOpenChange={setShowCreateHabit} onSuccess={fetchData} />
      <CreateChallengeModal open={showCreateChallenge} onOpenChange={setShowCreateChallenge} onSuccess={fetchData} />
      <PaywallModal open={showPaywall} onOpenChange={setShowPaywall} reason={paywallReason} />
      <EmergencyUrgeModal open={showEmergency} onClose={() => setShowEmergency(false)} />
      <BottomNavigation />
    </div>
  );
}
