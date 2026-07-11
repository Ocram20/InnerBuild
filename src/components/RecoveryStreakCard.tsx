import { useNavigate } from "react-router-dom";
import { Shield, ChevronRight, CheckCircle2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface RecoveryStreakCardProps {
  journey: {
    id: string;
    started_at: string;
    current_streak: number;
  } | null;
  checkIns: {
    checkin_date: string;
    status: "success" | "failed";
  }[];
  hasCheckedInToday: boolean;
  onCheckIn: (status: "success" | "failed") => void;
}

export default function RecoveryStreakCard({ 
  journey, 
  checkIns, 
  hasCheckedInToday,
  onCheckIn 
}: RecoveryStreakCardProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  if (!journey) {
    return null;
  }

  const currentStreak = journey.current_streak;

  // Journey day = number of successful check-ins (aligned with challenge progression)
  const successDays = checkIns.filter(c => c.status === "success").length;

  return (
    <div className="rounded-2xl border border-border/60 dark:border-white/5 bg-card dark:bg-[#1a212e] dark:border-white/5 dark:glass-card p-5 overflow-hidden shadow-elevated card-elevated dark:card-lift">
      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
        <div className="flex items-center gap-3 sm:block">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 dark:bg-[#4b9b75]/10 flex items-center justify-center shrink-0 shadow-soft">
            <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-primary dark:text-[#4b9b75]" />
          </div>
          <div className="flex-1 sm:hidden">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground dark:text-white">
                {t("recovery.recovery_streak")}
              </h2>
              <button
                onClick={() => navigate("/the-forge")}
                className="text-xs text-muted-foreground dark:text-[#6c8093] hover:text-foreground dark:hover:text-white flex items-center gap-1"
              >
                {t("common.details")}
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="hidden sm:flex items-center justify-between mb-1">
            <h2 className="text-base font-semibold text-foreground dark:text-white">
              {t("recovery.recovery_streak")}
            </h2>
            <button
              onClick={() => navigate("/the-forge")}
              className="text-xs text-muted-foreground dark:text-[#6c8093] hover:text-foreground dark:hover:text-white flex items-center gap-1"
            >
              {t("common.details")}
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary dark:text-[#4b9b75]" />
              <span className="text-xl sm:text-2xl font-bold text-foreground dark:text-white">
                {currentStreak}
              </span>
              <span className="text-xs sm:text-sm text-muted-foreground dark:text-[#6c8093]">{t("common.days")}</span>
            </div>
            <div className="text-xs text-muted-foreground dark:text-[#6c8093]">
              {t("recovery.day_of_journey", { day: successDays })}
            </div>
          </div>

          {!hasCheckedInToday && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button
                size="sm"
                className="h-8 w-full text-xs sm:flex-1 sm:text-sm bg-[#4b9b75] hover:bg-[#4b9b75] text-white shadow-lg shadow-[#4b9b75]/20 rounded-2xl font-bold"
                onClick={() => onCheckIn("success")}
              >
                <Check className="h-3 w-3 mr-1" />
                {t("recovery.clean_day")}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 w-full px-2 text-xs sm:w-auto sm:px-3 sm:text-sm bg-white dark:bg-white/5 border border-red-100 dark:border-white/10 text-[#ff4757] shadow-sm rounded-2xl font-bold"
                onClick={() => onCheckIn("failed")}
              >
                <X className="h-3 w-3 mr-1" />
                {t("recovery.relapsed")}
              </Button>
            </div>
          )}

          {hasCheckedInToday && (
            <p className="text-xs text-muted-foreground dark:text-[#6c8093] flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-primary dark:text-[#4b9b75]" />
              {t("recovery.checked_in_today")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
