import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Flame,
  Trophy,
  CheckCircle2,
  XCircle,
  Calendar,
  RotateCcw,
  LogOut,
  ShieldAlert,
} from "lucide-react";
import { format } from "date-fns";
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
import { useTranslation } from "react-i18next";
import { dateFnsLocale } from "@/lib/dateFnsLocale";

interface CheckIn {
  id: string;
  checkin_date: string;
  status: "success" | "failed";
}

interface RecoveryTrackerProps {
  startedAt: string;
  checkIns: CheckIn[];
  onCheckIn: (status: "success" | "failed") => void;
  onReset: () => void;
  onAbandon: () => void;
  onResume?: () => void;
  hasCheckedInToday: boolean;
  currentStreak: number;
  longestStreak: number;
  jokersRemaining: number;
  status: string;
}

export function RecoveryTracker({
  startedAt,
  checkIns,
  onCheckIn,
  onReset,
  onAbandon,
  onResume,
  hasCheckedInToday,
  currentStreak,
  longestStreak,
  jokersRemaining,
  status,
}: RecoveryTrackerProps) {
  const { t, i18n } = useTranslation();
  const dfLocale = dateFnsLocale(i18n.resolvedLanguage || i18n.language);
  const successDays = checkIns.filter((c) => c.status === "success").length;
  const failedDays = checkIns.filter((c) => c.status === "failed").length;
  const jokers = jokersRemaining;
  const isPausedByJokers = status === "paused" && jokers <= 0;

  const startedLabel = format(new Date(startedAt), "dd MMM yyyy", { locale: dfLocale });

  return (
    <Card className="border-border/60 bg-card/80 backdrop-blur-md shadow-xl overflow-hidden rounded-2xl">
      <CardHeader className="pb-3 pt-5 px-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#4D87D9]/10 text-[#4D87D9] dark:text-[#619BF0] border border-[#4D87D9]/20 rounded-xl shadow-[0_0_12px_rgba(77,135,217,0.15)]">
              <Flame className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg font-bold text-foreground">{t("recovery_tracker.title")}</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t("recovery_tracker.started", { date: startedLabel })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 mr-1" title={`${jokers}`}>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    i < jokers ? "bg-[#4D87D9] dark:bg-[#619BF0] shadow-[0_0_8px_rgba(77,135,217,0.5)]" : "bg-muted-foreground/20"
                  }`}
                />
              ))}
            </div>
            <Badge variant="secondary" className="bg-[#4D87D9]/10 border border-[#4D87D9]/30 text-[#4D87D9] dark:text-[#619BF0] text-xs font-semibold px-2.5 py-0.5">
              {t("recovery_tracker.day_n", { n: successDays })}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 pb-5 pt-1 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Serie Corrente: Azzurro */}
          <div className="text-center p-3.5 bg-card dark:bg-[#192028]/60 border border-[#4D87D9]/30 rounded-xl shadow-sm">
            <Flame className="h-5 w-5 text-[#4D87D9] dark:text-[#619BF0] mx-auto mb-1" />
            <p className="text-2xl font-extrabold text-[#4D87D9] dark:text-[#619BF0]">{currentStreak}</p>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">{t("recovery_tracker.current_streak")}</p>
          </div>
          {/* Serie Più Lunga: Oro Solo Scritte, Icone e Bordi */}
          <div className="text-center p-3.5 bg-card dark:bg-[#192028]/60 border border-amber-500/30 rounded-xl shadow-sm">
            <Trophy className="h-5 w-5 text-amber-500 dark:text-amber-300 mx-auto mb-1 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
            <p className="text-2xl font-extrabold text-amber-500 dark:text-amber-300">{longestStreak}</p>
            <p className="text-xs text-amber-600 dark:text-amber-400/90 font-semibold mt-0.5">{t("recovery_tracker.longest_streak")}</p>
          </div>
          {/* Giorni di Successo: Verde */}
          <div className="text-center p-3.5 bg-card dark:bg-[#192028]/60 border border-[#4b9b75]/20 rounded-xl shadow-sm">
            <CheckCircle2 className="h-5 w-5 text-[#4b9b75] dark:text-[#5ec396] mx-auto mb-1" />
            <p className="text-2xl font-extrabold text-foreground">{successDays}</p>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">{t("recovery_tracker.success_days")}</p>
          </div>
          {/* Giorni Falliti */}
          <div className="text-center p-3.5 bg-card dark:bg-[#192028]/60 border border-[#ef4444]/20 rounded-xl shadow-sm">
            <XCircle className="h-5 w-5 text-[#ef4444] mx-auto mb-1" />
            <p className="text-2xl font-extrabold text-foreground">{failedDays}</p>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">{t("recovery_tracker.failed_days")}</p>
          </div>
        </div>

        {isPausedByJokers && (
          <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20 text-center space-y-3">
            <div className="flex items-center justify-center gap-2">
              <ShieldAlert className="h-4 w-4 text-destructive" />
              <p className="text-sm font-medium text-foreground">{t("challenge_card.all_jokers_used")}</p>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t("challenge_card.paused_at_day", { day: currentStreak })}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onResume}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#4b9b75] dark:bg-[#5ec396] text-white text-sm font-medium"
              >
                {t("challenge_card.resume")}
              </button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    type="button"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-muted text-foreground text-sm font-medium"
                  >
                    {t("challenge_card.reset")}
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t("recovery_tracker.start_fresh_title")}</AlertDialogTitle>
                    <AlertDialogDescription>{t("recovery_tracker.start_fresh_desc")}</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                    <AlertDialogAction onClick={onReset}>{t("recovery_tracker.start_fresh")}</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            <p className="text-[10px] text-muted-foreground/70">{t("challenge_card.resume_no_jokers")}</p>
          </div>
        )}

        {!isPausedByJokers && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{t("recovery_tracker.todays_checkin")}</span>
            </div>

            {hasCheckedInToday ? (
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <CheckCircle2 className="h-8 w-8 text-[#4b9b75] dark:text-[#5ec396] mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">{t("recovery_tracker.already_checked_in")}</p>
              </div>
            ) : status === "active" ? (
              <div className="flex gap-3">
                <Button onClick={() => onCheckIn("success")} className="flex-1 bg-[#4b9b75] hover:bg-[#4b9b75]/90 dark:bg-[#5ec396] text-white">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  {t("recovery_tracker.success")}
                </Button>
                <Button onClick={() => onCheckIn("failed")} variant="destructive" className="flex-1 bg-[#ef4444] hover:bg-[#ef4444]/90 text-white">
                  <XCircle className="h-4 w-4 mr-2" />
                  {t("recovery_tracker.failed")}
                </Button>
              </div>
            ) : null}
          </div>
        )}

        <div className="pt-2 border-t border-border flex items-center justify-between">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <RotateCcw className="h-4 w-4 mr-2" />
                {t("recovery_tracker.start_fresh")}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("recovery_tracker.start_fresh_title")}</AlertDialogTitle>
                <AlertDialogDescription>{t("recovery_tracker.start_fresh_desc")}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                <AlertDialogAction onClick={onReset}>{t("recovery_tracker.start_fresh")}</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                <LogOut className="h-4 w-4 mr-2" />
                {t("recovery_tracker.abandon")}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("recovery_tracker.abandon_title")}</AlertDialogTitle>
                <AlertDialogDescription>{t("recovery_tracker.abandon_desc")}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                <AlertDialogAction onClick={onAbandon} className="bg-destructive hover:bg-destructive/90">
                  {t("recovery_tracker.abandon")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
