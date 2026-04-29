import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { format, addDays } from "date-fns";
import type { Locale } from "date-fns";
import { enUS, it as itLocale, zhCN, de, fr, es, ptBR, ru, ro } from "date-fns/locale";
import { ToDoSection } from "@/components/daily-planning/ToDoSection";
import { NotToDoSection } from "@/components/daily-planning/NotToDoSection";
import { ActiveHabitsSection } from "@/components/daily-planning/ActiveHabitsSection";

import BottomNavigation from "@/components/BottomNavigation";
import { useTranslation } from "react-i18next";
import { cleanupExpiredDailyPlanningItems } from "@/lib/dailyPlanningCleanup";

const DATE_FNS_LOCALES: Record<string, Locale> = {
  en: enUS,
  it: itLocale,
  zh: zhCN,
  de,
  fr,
  es,
  pt: ptBR,
  ru,
  ro,
};

function dateFnsLocale(code: string): Locale {
  const base = (code || "it").split("-")[0];
  return DATE_FNS_LOCALES[base] ?? itLocale;
}
const DailyPlanning = () => {
  const { i18n, t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const fromExplore = location.state?.from === "explore";
  const dateLocale = dateFnsLocale(i18n.resolvedLanguage || i18n.language || "it");

  type PlanningMode = "today" | "tomorrow";
  const [planningMode, setPlanningMode] = useState<PlanningMode>("tomorrow");
  const [targetDateISO, setTargetDateISO] = useState<string>("");

  const getTodayTomorrow = () => {
    const now = new Date();
    const today = now;
    const tomorrow = addDays(now, 1);
    const todayISO = format(today, "yyyy-MM-dd");
    const tomorrowISO = format(tomorrow, "yyyy-MM-dd");
    return { today, tomorrow, todayISO, tomorrowISO };
  };

  const { todayISO, tomorrowISO } = getTodayTomorrow();

  const effectiveTargetDateISO = targetDateISO || tomorrowISO;
  const selectedLabel = planningMode === "today" ? t("activity_calendar.legend.today") : t("daily_planning.tomorrow");
  const selectedDate = new Date(`${effectiveTargetDateISO}T00:00:00`);

  const modeKey = user?.id ? `innerbuild-daily-planning-mode:${user.id}` : null;
  const targetKey = user?.id ? `innerbuild-daily-planning-targetDate:${user.id}` : null;
  const targetDateISORef = useRef(targetDateISO);
  useEffect(() => {
    targetDateISORef.current = targetDateISO;
  }, [targetDateISO]);

  // Load stored selection (per user). If it's expired, reset it for the current day.
  useEffect(() => {
    if (!user?.id || !modeKey || !targetKey) return;

    const storedTarget = localStorage.getItem(targetKey);

    const isExpired = storedTarget ? storedTarget < todayISO : false;

    if (!storedTarget) {
      setPlanningMode("tomorrow");
      setTargetDateISO(tomorrowISO);
      localStorage.setItem(modeKey, "tomorrow");
      localStorage.setItem(targetKey, tomorrowISO);
      return;
    }

    if (isExpired) {
      setPlanningMode("tomorrow");
      setTargetDateISO(tomorrowISO);
      localStorage.setItem(modeKey, "tomorrow");
      localStorage.setItem(targetKey, tomorrowISO);
      return;
    }

    const isValidWindow = storedTarget === todayISO || storedTarget === tomorrowISO;
    if (!isValidWindow) {
      setPlanningMode("tomorrow");
      setTargetDateISO(tomorrowISO);
      localStorage.setItem(modeKey, "tomorrow");
      localStorage.setItem(targetKey, tomorrowISO);
      return;
    }

    // Derive which button should be active from the stored target day itself.
    const finalMode: PlanningMode = storedTarget === todayISO ? "today" : "tomorrow";
    setPlanningMode(finalMode);
    setTargetDateISO(storedTarget);
    localStorage.setItem(modeKey, finalMode);
    localStorage.setItem(targetKey, storedTarget);
  }, [user?.id, modeKey, targetKey, todayISO, tomorrowISO]);

  useEffect(() => {
    if (!user?.id) return;
    void cleanupExpiredDailyPlanningItems(user.id);
  }, [user?.id]);

  const applyMode = (mode: PlanningMode) => {
    if (!user?.id || !modeKey || !targetKey) return;
    // Use current day boundaries for the user's decision.
    const now = new Date();
    const todayISO2 = format(now, "yyyy-MM-dd");
    const tomorrowISO2 = format(addDays(now, 1), "yyyy-MM-dd");
    const nextTarget = mode === "today" ? todayISO2 : tomorrowISO2;
    setPlanningMode(mode);
    setTargetDateISO(nextTarget);
    localStorage.setItem(modeKey, mode);
    localStorage.setItem(targetKey, nextTarget);
  };

  // Midnight reset: keep selection active for the entire chosen day,
  // then expire it right after midnight.
  useEffect(() => {
    if (!user?.id || !targetDateISO) return;

    let timeoutId: number | undefined;

    const scheduleNext = () => {
      const now = new Date();
      const nextMidnight = new Date(now);
      nextMidnight.setHours(24, 0, 0, 0);

      const msUntil = nextMidnight.getTime() - now.getTime();
      timeoutId = window.setTimeout(() => {
        const now2 = new Date();
        const todayISO2 = format(now2, "yyyy-MM-dd");
        const tomorrowISO2 = format(addDays(now2, 1), "yyyy-MM-dd");

        const currentTarget = targetDateISORef.current;
        if (currentTarget < todayISO2) {
          // target expired -> reset to "tomorrow" mode's fresh window
          // i.e. show the app's default "tomorrow" planning after midnight.
          setPlanningMode("tomorrow");
          setTargetDateISO(tomorrowISO2);
          if (modeKey) localStorage.setItem(modeKey, "tomorrow");
          if (targetKey) localStorage.setItem(targetKey, tomorrowISO2);
        } else {
          // Not expired: the target day might have become "today".
          const derivedMode: PlanningMode = currentTarget === todayISO2 ? "today" : "tomorrow";
          setPlanningMode(derivedMode);
          if (modeKey) localStorage.setItem(modeKey, derivedMode);
        }

        scheduleNext();
      }, Math.max(msUntil, 1000));
    };

    scheduleNext();
    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [user?.id, targetDateISO, modeKey, targetKey]);

  return (
    <div className="min-h-screen bg-background pb-app-main">
      <header className="sticky top-0 safe-area-header z-50 glass border-b">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-start sm:items-center justify-between gap-2">
            <div className="flex items-start sm:items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <Button variant="ghost" size="icon" onClick={() => navigate(fromExplore ? "/explore" : "/dashboard")} className="rounded-full shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <div className="min-w-0 flex-1">
                <h1 className="text-base sm:text-xl font-bold flex items-center gap-2">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
                  <span className="truncate">{t("daily_planning.title")}</span>
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  {selectedLabel},{" "}
                  {format(selectedDate, "EEEE, MMMM d", { locale: dateLocale })}
                </p>
                <div className="mt-2 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => applyMode("today")}
                    className={[
                      "rounded-full px-4",
                      planningMode === "today"
                        ? "bg-primary/10 border-primary/30 text-primary hover:bg-primary/15 hover:text-primary"
                        : "bg-transparent border-border/50 text-muted-foreground hover:bg-muted hover:text-foreground/90",
                    ].join(" ")}
                  >
                    {t("activity_calendar.legend.today")}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => applyMode("tomorrow")}
                    className={[
                      "rounded-full px-4",
                      planningMode === "tomorrow"
                        ? "bg-primary/10 border-primary/30 text-primary hover:bg-primary/15 hover:text-primary"
                        : "bg-transparent border-border/50 text-muted-foreground hover:bg-muted hover:text-foreground/90",
                    ].join(" ")}
                  >
                    {t("daily_planning.tomorrow")}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6 max-w-4xl">

        <div className="grid md:grid-cols-2 gap-6">
          <ToDoSection userId={user?.id} targetDate={effectiveTargetDateISO} planningMode={planningMode} />
          <NotToDoSection userId={user?.id} targetDate={effectiveTargetDateISO} planningMode={planningMode} />
        </div>
        <ActiveHabitsSection userId={user?.id} targetDate={todayISO} />
      </main>
      <BottomNavigation />
    </div>
  );
};

export default DailyPlanning;
