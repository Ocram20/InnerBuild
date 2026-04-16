import React from "react";
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
    <Card className="overflow-hidden border-amber-500/20 bg-gradient-to-b from-amber-500/5 to-background">
      <CardHeader className="pb-3 pt-4 px-4">
        <CardTitle className="text-sm font-semibold tracking-wide">
          {t("recovery_impact.simulation_title")}
        </CardTitle>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {t("recovery_impact.simulation_subtitle")}
        </p>
      </CardHeader>

      <CardContent className="px-4 pb-4 space-y-4">
        {loading || !data ? (
          <div className="rounded-xl bg-background/50 p-4 text-sm text-muted-foreground text-center">
            {t("common.loading")}
          </div>
        ) : (
          <>
            {/* Ring — always on top, centered */}
            <div className="flex justify-center">
              <HomeostasisRing
                state="trigger"
                primaryLabel={String(currentStreak)}
                secondaryLabel={t("recovery_impact.clean_days_label")}
                caption={t("recovery_impact.ring_trigger_caption")}
              />
            </div>

            {/* Two panels side by side */}
            <div className="grid grid-cols-2 gap-3">
              {/* Give-in panel */}
              <div className="rounded-xl border border-red-900/40 bg-red-950/20 p-3 flex flex-col gap-2">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-red-300/90 mb-1">
                  {t("recovery_impact.if_you_give_in")}
                </h4>
                <SimItem icon={<Clock3 className="h-3.5 w-3.5 text-red-400 flex-shrink-0 mt-0.5" />} color="red">
                  {t("recovery_impact.givein_time_loss")}
                </SimItem>
                <SimItem icon={<TrendingUp className="h-3.5 w-3.5 text-red-400 flex-shrink-0 mt-0.5" />} color="red">
                  {t("recovery_impact.givein_energy", {
                    energy: energyBandLabel(data.projectedRelapseEnergy, t),
                  })}
                </SimItem>
                <SimItem icon={<AlertTriangle className="h-3.5 w-3.5 text-red-400 flex-shrink-0 mt-0.5" />} color="red">
                  {journeyText}
                </SimItem>
              </div>

              {/* Resist panel */}
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/10 p-3 flex flex-col gap-2">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-emerald-300/90 mb-1">
                  {t("recovery_impact.if_you_resist")}
                </h4>
                <SimItem icon={<Clock3 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />} color="green">
                  {resistText}
                </SimItem>
                <SimItem icon={<TrendingUp className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />} color="green">
                  {t("recovery_impact.resist_energy", {
                    energy: energyBandLabel(data.projectedResistEnergy, t),
                  })}
                </SimItem>
                <SimItem icon={<CheckSquare2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />} color="green">
                  {t("recovery_impact.resist_journey")}
                </SimItem>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2 pt-1">
              <Button
                onClick={onExit}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                {t("recovery_impact.exit_save")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                onClick={onDeclareRelapse}
                disabled={hasCheckedInToday}
                className="w-full text-muted-foreground hover:text-foreground text-sm"
              >
                {hasCheckedInToday
                  ? t("recovery_impact.already_checked_in")
                  : t("recovery_impact.declare_relapse")}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Small helper component for consistent row styling
function SimItem({
  icon,
  color,
  children,
}: {
  icon: React.ReactNode;
  color: "red" | "green";
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-1.5 items-start">
      {icon}
      <span
        className={`text-[11px] leading-snug ${
          color === "red" ? "text-red-100/80" : "text-emerald-100/80"
        }`}
      >
        {children}
      </span>
    </div>
  );
}
