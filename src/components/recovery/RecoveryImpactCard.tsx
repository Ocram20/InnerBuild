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
    <Card className="overflow-hidden border-border/50 bg-gradient-to-br from-card to-card/80">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{t("recovery_impact.title")}</CardTitle>
        <p className="text-sm text-muted-foreground">{t("recovery_impact.subtitle")}</p>
      </CardHeader>
      <CardContent className="space-y-5">
        {loading || !data ? (
          <div className="rounded-xl bg-muted/30 p-6 text-center text-sm text-muted-foreground">
            {t("common.loading")}
          </div>
        ) : (
          <>
            <HomeostasisRing
              state={data.ringState}
              primaryLabel={String(currentStreak)}
              secondaryLabel={t("recovery_impact.clean_days_label")}
              caption={t("recovery_impact.homeostasis_caption")}
            />

            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-xl border border-border/50 bg-muted/30 p-4">
                <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                  <Clock3 className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-widest">{t("recovery_impact.time_saved_label")}</span>
                </div>
                <p className="text-2xl font-semibold text-foreground">{hoursRecovered}</p>
                <p className="text-xs text-muted-foreground">{t("recovery_impact.hours_recovered")}</p>
              </div>

              <div className="rounded-xl border border-border/50 bg-muted/30 p-4">
                <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-widest">{t("recovery_impact.energy_label")}</span>
                </div>
                <p className="text-sm font-semibold text-foreground">{energySummary}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t("recovery_impact.clean_vs_relapse")}</p>
              </div>

              <div className="rounded-xl border border-border/50 bg-muted/30 p-4">
                <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                  <CheckSquare2 className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-widest">{t("recovery_impact.tasks_label")}</span>
                </div>
                <p className="text-2xl font-semibold text-foreground">{data.protectedTasks}</p>
                <p className="text-xs text-muted-foreground">{t("recovery_impact.tasks_protected")}</p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
