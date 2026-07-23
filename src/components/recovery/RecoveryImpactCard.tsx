import { Clock3, TrendingUp, CheckSquare2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { HomeostasisRing } from "./HomeostasisRing";
import { useRecoveryImpact } from "@/hooks/useRecoveryImpact";

interface RecoveryImpactCardProps {
  journeyId: string;
  currentStreak: number;
  jokersRemaining: number;
  status: string;
}

export function RecoveryImpactCard({
  journeyId,
  currentStreak,
  jokersRemaining,
  status,
}: RecoveryImpactCardProps) {
  const { t } = useTranslation();
  const { data, loading, hoursRecovered } = useRecoveryImpact({
    journeyId,
    currentStreak,
    jokersRemaining,
    status,
    mode: "summary",
  });

  const energySummary = !data || data.energyTrendDelta === null
    ? t("recovery_impact.energy_unknown")
    : data.energyTrendDirection === "up"
      ? t("recovery_impact.energy_up", { value: data.energyTrendDelta.toFixed(1) })
      : data.energyTrendDirection === "down"
        ? t("recovery_impact.energy_down", { value: Math.abs(data.energyTrendDelta).toFixed(1) })
        : t("recovery_impact.energy_stable");

  return (
    <Card className="border-border/60 bg-card/80 backdrop-blur-md shadow-xl overflow-hidden rounded-2xl">
      <CardHeader className="pb-3 pt-5 px-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#4D87D9]/10 text-[#4D87D9] dark:text-[#619BF0] border border-[#4D87D9]/20 shadow-[0_0_12px_rgba(77,135,217,0.15)]">
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div>
            <CardTitle className="text-base sm:text-lg font-bold text-foreground">{t("recovery_impact.title")}</CardTitle>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{t("recovery_impact.subtitle")}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 pb-5 pt-1 space-y-5">
        {loading || !data ? (
          <div className="rounded-xl bg-slate-900/60 border border-border/40 p-6 text-center text-sm text-muted-foreground">
            {t("common.loading")}
          </div>
        ) : (
          <>
            <div className="flex justify-center py-2">
              <HomeostasisRing
                state={data.ringState}
                primaryLabel={String(currentStreak)}
                secondaryLabel={t("recovery_impact.clean_days_label")}
                caption={t("recovery_impact.homeostasis_caption")}
              />
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-xl border border border-[#4D87D9]/20 bg-[#192028]/60 backdrop-blur-sm p-4 hover:border-[#4D87D9]/40 transition-all shadow-sm">
                <div className="mb-2 flex items-center gap-2 text-[#4D87D9] dark:text-[#619BF0] font-semibold">
                  <Clock3 className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-widest">{t("recovery_impact.time_saved_label")}</span>
                </div>
                <p className="text-2xl font-extrabold text-foreground">{hoursRecovered}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t("recovery_impact.hours_recovered")}</p>
              </div>

              <div className="rounded-xl border border border-[#4D87D9]/20 bg-[#192028]/60 backdrop-blur-sm p-4 hover:border-[#4D87D9]/40 transition-all shadow-sm">
                <div className="mb-2 flex items-center gap-2 text-[#4D87D9] dark:text-[#619BF0] font-semibold">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-widest">{t("recovery_impact.energy_label")}</span>
                </div>
                <p className="text-sm font-bold text-foreground">{energySummary}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t("recovery_impact.clean_vs_relapse")}</p>
              </div>

              <div className="rounded-xl border border border-[#4D87D9]/20 bg-[#192028]/60 backdrop-blur-sm p-4 hover:border-[#4D87D9]/40 transition-all shadow-sm">
                <div className="mb-2 flex items-center gap-2 text-[#4D87D9] dark:text-[#619BF0] font-semibold">
                  <CheckSquare2 className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-widest">{t("recovery_impact.tasks_label")}</span>
                </div>
                <p className="text-2xl font-extrabold text-foreground">{data.protectedTasks}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t("recovery_impact.tasks_protected")}</p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
