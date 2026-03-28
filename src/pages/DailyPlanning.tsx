import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { format, addDays } from "date-fns";
import { enUS, it, es, de, fr, ru, ro } from "date-fns/locale";
import { ToDoSection } from "@/components/daily-planning/ToDoSection";
import { NotToDoSection } from "@/components/daily-planning/NotToDoSection";
import { ActiveHabitsSection } from "@/components/daily-planning/ActiveHabitsSection";
import { EveningReminderBanner } from "@/components/daily-planning/EveningReminderBanner";
import BottomNavigation from "@/components/BottomNavigation";
import { useTranslation } from "react-i18next";

const localeMap: Record<string, Locale> = { it, en: enUS, es, de, fr, ru, ro };

const DailyPlanning = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const fromExplore = location.state?.from === "explore";
  const dateLocale = localeMap[i18n.language] || enUS;

  const today = new Date();
  const tomorrow = addDays(today, 1);

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-50 glass border-b">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-start sm:items-center justify-between gap-2">
            <div className="flex items-start sm:items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <Button variant="ghost" size="icon" onClick={() => navigate(fromExplore ? "/explore" : "/dashboard")} className="rounded-full shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <div className="min-w-0 flex-1">
                <h1 className="text-base sm:text-xl font-bold flex items-center gap-2">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
                  <span className="truncate">{t("dashboard.daily_planning")}</span>
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  {format(tomorrow, "EEEE, MMMM d", { locale: dateLocale })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6 max-w-4xl">
        <EveningReminderBanner userId={user?.id} />
        <div className="grid md:grid-cols-2 gap-6">
          <ToDoSection userId={user?.id} targetDate={format(tomorrow, "yyyy-MM-dd")} />
          <NotToDoSection userId={user?.id} targetDate={format(tomorrow, "yyyy-MM-dd")} />
        </div>
        <ActiveHabitsSection userId={user?.id} targetDate={format(today, "yyyy-MM-dd")} />
      </main>
      <BottomNavigation />
    </div>
  );
};

export default DailyPlanning;
