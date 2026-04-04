import { useMemo } from "react";
import {
  Lightbulb,
  Shield,
  MapPin,
  Flame,
  Dumbbell,
  Brain,
  PenLine,
  Users,
  TreePine,
  Gamepad2,
  Moon,
  Heart,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

const STRATEGY_IDS = [
  "remove_access",
  "change_env",
  "track_streak",
  "exercise",
  "meditation",
  "cold_showers",
  "journaling",
  "social",
  "nature",
  "hobbies",
  "prioritize_sleep",
  "self_compassion",
] as const;

type StrategyId = (typeof STRATEGY_IDS)[number];

const STRATEGY_ICONS: Record<StrategyId, LucideIcon> = {
  remove_access: Shield,
  change_env: MapPin,
  track_streak: Flame,
  exercise: Dumbbell,
  meditation: Brain,
  cold_showers: Dumbbell,
  journaling: PenLine,
  social: Users,
  nature: TreePine,
  hobbies: Gamepad2,
  prioritize_sleep: Moon,
  self_compassion: Heart,
};

const STRATEGY_STYLES: Record<StrategyId, { color: string; bgColor: string }> = {
  remove_access: { color: "text-rose-500", bgColor: "bg-rose-500/10" },
  change_env: { color: "text-blue-500", bgColor: "bg-blue-500/10" },
  track_streak: { color: "text-amber-500", bgColor: "bg-amber-500/10" },
  exercise: { color: "text-emerald-500", bgColor: "bg-emerald-500/10" },
  meditation: { color: "text-purple-500", bgColor: "bg-purple-500/10" },
  cold_showers: { color: "text-cyan-500", bgColor: "bg-cyan-500/10" },
  journaling: { color: "text-pink-500", bgColor: "bg-pink-500/10" },
  social: { color: "text-indigo-500", bgColor: "bg-indigo-500/10" },
  nature: { color: "text-green-500", bgColor: "bg-green-500/10" },
  hobbies: { color: "text-orange-500", bgColor: "bg-orange-500/10" },
  prioritize_sleep: { color: "text-slate-500", bgColor: "bg-slate-500/10" },
  self_compassion: { color: "text-rose-400", bgColor: "bg-rose-400/10" },
};

export function StrategiesSection() {
  const { t } = useTranslation();

  const strategies = useMemo(
    () =>
      STRATEGY_IDS.map((id) => ({
        id,
        icon: STRATEGY_ICONS[id],
        title: t(`strategies_section.${id}_title`),
        description: t(`strategies_section.${id}_desc`),
        ...STRATEGY_STYLES[id],
      })),
    [t]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          {t("strategies_section.title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm mb-4">{t("strategies_section.description")}</p>

        <div className="grid gap-3">
          {strategies.map((strategy) => {
            const Icon = strategy.icon;
            return (
              <div
                key={strategy.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className={`p-2 rounded-lg ${strategy.bgColor} shrink-0`}>
                  <Icon className={`h-4 w-4 ${strategy.color}`} />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">{strategy.title}</p>
                  <p className="text-xs text-muted-foreground">{strategy.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
