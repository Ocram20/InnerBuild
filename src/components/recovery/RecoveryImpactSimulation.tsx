import { AlertTriangle, ArrowRight, CheckSquare2, Clock3, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { HomeostasisRing } from "./HomeostasisRing";
import { useRecoveryImpact } from "@/hooks/useRecoveryImpact";

interface RecoveryImpactSimulationProps {
  journeyId: string;
  currentStreak: number;
  jokersRemaining: number;
  status: string;
  hasCheckedInToday: boolean;
  onExit: () => void;
  onDeclareRelapse: () => void;
}

function energyBandLabel(value: number | null, t: (key: string) => string) {
  if (value === null) return t("recovery_impact.energy_unknown_short");
  if (value >= 7) return t("recovery_impact.energy_high");
  if (value >= 4) return t("recovery_impact.energy_medium");
  return t("recovery_impact.energy_low");
}

export function RecoveryImpactSimulation({
  journeyId,
  currentStreak,
  jokersRemaining,
  status,
  hasCheckedInToday,
  onExit,
  onDeclareRelapse,
}: RecoveryImpactSimulationProps) {
  const { t } = useTranslation();
  const { data, loading } = useRecoveryImpact({
    journeyId,
    currentStreak,
    jokersRemaining,
    status,
    mode: "trigger",
  });

  const resistText = data?.pendingTaskTitle
    ? t("recovery_impact.resist_gain_task", { task: data.pendingTaskTitle })
    : t("recovery_impact.resist_gain_time");

  const journeyText = jokersRemaining > 0
    ? t("recovery_impact.givein_slowdown", { days: data?.journeySlowdownDays ?? 1 })
    : t("recovery_impact.givein_pause");

  return (
    <Card className="overflow-hidden border-amber-500/20 bg-amber-500/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{t("recovery_impact.simulation_title")}</CardTitle>
        <p className="text-sm text-muted-foreground">{t("recovery_impact.simulation_subtitle")}</p>
      </CardHeader>
      <CardContent className="space-y-5">
        {loading || !data ? (
          <div className="rounded-xl bg-background/50 p-4 text-sm text-muted-foreground">{t("common.loading")}</div>
        ) : (
          <>
            <div className="grid items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
              <div className="rounded-xl border border-red-900/30 bg-red-950/20 p-4">
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-red-300/80">
                  {t("recovery_impact.if_you_give_in")}
                </h4>
                <div className="space-y-3">
                  <div className="flex gap-2 text-sm text-foreground">
                    <Clock3 className="mt-0.5 h-4 w-4 text-red-400" />
                    <span>{t("recovery_impact.givein_time_loss")}</span>
                  </div>
                  <div className="flex gap-2 text-sm text-foreground">
                    <TrendingUp className="mt-0.5 h-4 w-4 text-red-400" />
                    <span>
                      {t("recovery_impact.givein_energy", {
                        energy: energyBandLabel(data.projectedRelapseEnergy, t),
                      })}
                    </span>
                  </div>
                  <div className="flex gap-2 text-sm text-foreground">
                    <AlertTriangle className="mt-0.5 h-4 w-4 text-red-400" />
                    <span>{journeyText}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <HomeostasisRing
                  state="trigger"
                  primaryLabel={String(currentStreak)}
                  secondaryLabel={t("recovery_impact.clean_days_label")}
                  caption={t("recovery_impact.ring_trigger_caption")}
                  className="h-32 w-32"
                />
              </div>

              <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/10 p-4">
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-emerald-300/80">
                  {t("recovery_impact.if_you_resist")}
                </h4>
                <div className="space-y-3">
                  <div className="flex gap-2 text-sm text-foreground">
                    <Clock3 className="mt-0.5 h-4 w-4 text-emerald-400" />
                    <span>{resistText}</span>
                  </div>
                  <div className="flex gap-2 text-sm text-foreground">
                    <TrendingUp className="mt-0.5 h-4 w-4 text-emerald-400" />
                    <span>
                      {t("recovery_impact.resist_energy", {
                        energy: energyBandLabel(data.projectedResistEnergy, t),
                      })}
                    </span>
                  </div>
                  <div className="flex gap-2 text-sm text-foreground">
                    <CheckSquare2 className="mt-0.5 h-4 w-4 text-emerald-400" />
                    <span>{t("recovery_impact.resist_journey")}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button onClick={onExit} className="w-full bg-emerald-600 hover:bg-emerald-700">
                {t("recovery_impact.exit_save")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                onClick={onDeclareRelapse}
                disabled={hasCheckedInToday}
                className="w-full text-muted-foreground hover:text-foreground"
              >
                {hasCheckedInToday ? t("recovery_impact.already_checked_in") : t("recovery_impact.declare_relapse")}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
