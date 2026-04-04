import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Leaf, Zap, Shield, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProgressOverview } from "@/hooks/useProgressData";

interface Props {
  overview: ProgressOverview;
  onCardTap: (section: "habits" | "triggers" | "challenges" | "mood") => void;
  timeRange?: "recent" | "annual";
}

export function ProgressOverviewCards({ overview, onCardTap, timeRange = "recent" }: Props) {
  const { t } = useTranslation();
  const periodDays = timeRange === "recent" ? 14 : 365;

  const cards = useMemo(() => {
    const periodLabel = t("profile.last_n_days", { days: periodDays });
    const vsLabel = t("profile.vs_previous", { days: periodDays });

    return [
      {
        key: "habits" as const,
        icon: Leaf,
        title: t("profile.positive_habits"),
        value:
          overview.habits.trend === "stable"
            ? t("profile.stable")
            : `${overview.habits.trend === "up" ? "+" : "−"}${overview.habits.trendValue}% ${t("profile.consistency")}`,
        subtitle: periodLabel,
        trend: overview.habits.trend,
        trendColor:
          overview.habits.trend === "up"
            ? "text-emerald-600 dark:text-emerald-400"
            : overview.habits.trend === "down"
              ? "text-amber-600 dark:text-amber-400"
              : "text-muted-foreground",
      },
      {
        key: "triggers" as const,
        icon: Zap,
        title: t("profile.triggers_title"),
        value:
          overview.triggers.currentCount === 0 && overview.triggers.previousCount === 0
            ? t("profile.no_data_yet")
            : overview.triggers.trend === "up"
              ? `−${overview.triggers.trendValue}% ${t("profile.frequency")}`
              : overview.triggers.trend === "down"
                ? `+${overview.triggers.trendValue}% ${t("profile.frequency")}`
                : t("profile.stable"),
        subtitle: vsLabel,
        trend: overview.triggers.trend,
        trendColor:
          overview.triggers.trend === "up"
            ? "text-emerald-600 dark:text-emerald-400"
            : overview.triggers.trend === "down"
              ? "text-amber-600 dark:text-amber-400"
              : "text-muted-foreground",
      },
      {
        key: "challenges" as const,
        icon: Shield,
        title: t("profile.detox_challenges"),
        value: t("profile.completed_active", {
          completed: overview.challenges.completed,
          active: overview.challenges.active,
        }),
        subtitle: "",
        trend: "stable" as const,
        trendColor: "text-primary",
      },
      {
        key: "mood" as const,
        icon: Heart,
        title: t("profile.emotional_awareness"),
        value:
          overview.mood.currentAvg === 0
            ? t("profile.start_tracking")
            : overview.mood.trend === "up"
              ? t("profile.avg_mood_up")
              : overview.mood.trend === "down"
                ? t("profile.avg_mood_down")
                : t("profile.avg_mood_stable"),
        subtitle:
          overview.mood.reflectionDays > 0 ? t("profile.reflections", { count: overview.mood.reflectionDays }) : "",
        trend: overview.mood.trend,
        trendColor:
          overview.mood.trend === "up"
            ? "text-emerald-600 dark:text-emerald-400"
            : overview.mood.trend === "down"
              ? "text-amber-600 dark:text-amber-400"
              : "text-muted-foreground",
      },
    ];
  }, [t, overview, periodDays]);

  return (
    <section className="space-y-3 animate-fade-in">
      <div className="grid grid-cols-2 gap-3">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <button
              key={card.key}
              type="button"
              onClick={() => onCardTap(card.key)}
              className={cn(
                "text-left glass rounded-2xl p-4 space-y-2 transition-all duration-300",
                "hover:shadow-soft hover:scale-[1.02] active:scale-[0.98]",
                "animate-slide-up"
              )}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
              </div>
              <p className="text-xs font-medium text-muted-foreground">{card.title}</p>
              <p className={cn("text-sm font-semibold leading-tight", card.trendColor)}>{card.value}</p>
              {card.subtitle && <p className="text-[10px] text-muted-foreground">{card.subtitle}</p>}
            </button>
          );
        })}
      </div>
    </section>
  );
}
