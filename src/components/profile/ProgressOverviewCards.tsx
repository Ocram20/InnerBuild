import { useState } from "react";
import { useTranslation } from "react-i18next";
import { TrendingUp, TrendingDown, Minus, Leaf, Zap, Shield, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProgressOverview } from "@/hooks/useProgressData";

interface Props {
  overview: ProgressOverview;
  onCardTap: (section: "habits" | "triggers" | "challenges" | "mood") => void;
  timeRange?: "recent" | "annual";
}

const TrendIcon = ({ trend }: { trend: "up" | "down" | "stable" }) => {
  if (trend === "up") return <TrendingUp className="h-4 w-4" />;
  if (trend === "down") return <TrendingDown className="h-4 w-4" />;
  return <Minus className="h-4 w-4" />;
};

const TrendArrow = ({ trend }: { trend: "up" | "down" | "stable" }) => {
  if (trend === "up") return <span>↑</span>;
  if (trend === "down") return <span>↓</span>;
  return <span>→</span>;
};

export function ProgressOverviewCards({ overview, onCardTap, timeRange = "recent" }: Props) {
  const { t } = useTranslation();
  const periodLabel = timeRange === "recent" ? t("common.last_14_days", "Last 14 days") : t("common.last_365_days", "Last 365 days");
  const vsLabel = timeRange === "recent" ? t("progress_overview_cards.vs_previous") : t("progress_overview_cards.vs_previous");
  const cards = [
    {
      key: "habits" as const,
      icon: Leaf,
      title: t("progress_overview_cards.positive_habits"),
      value: overview.habits.trend === "stable"
        ? t("progress_overview_cards.holding_steady")
        : `${overview.habits.trend === "up" ? "+" : "−"}${overview.habits.trendValue}% ${t("progress_overview_cards.consistency")}`,
      subtitle: periodLabel,
      trend: overview.habits.trend,
      trendColor: overview.habits.trend === "up"
        ? "text-emerald-600 dark:text-emerald-400"
        : overview.habits.trend === "down"
          ? "text-amber-600 dark:text-amber-400"
          : "text-muted-foreground",
    },
    {
      key: "triggers" as const,
      icon: Zap,
      title: t("progress_overview_cards.triggers"),
      value: overview.triggers.currentCount === 0 && overview.triggers.previousCount === 0
        ? t("progress_overview_cards.no_data")
        : overview.triggers.trend === "up"
          ? `−${overview.triggers.trendValue}% ${t("progress_overview_cards.frequency")}`
          : overview.triggers.trend === "down"
            ? `+${overview.triggers.trendValue}% ${t("progress_overview_cards.frequency")}`
            : t("progress_overview_cards.stable"),
      subtitle: vsLabel,
      trend: overview.triggers.trend,
      trendColor: overview.triggers.trend === "up"
        ? "text-emerald-600 dark:text-emerald-400"
        : overview.triggers.trend === "down"
          ? "text-amber-600 dark:text-amber-400"
          : "text-muted-foreground",
    },
    {
      key: "challenges" as const,
      icon: Shield,
      title: t("progress_overview_cards.detox_challenges"),
      value: `${overview.challenges.completed} ${t("progress_overview_cards.completed")} · ${overview.challenges.active} ${t("progress_overview_cards.active")}`,
      subtitle: "",
      trend: "stable" as const,
      trendColor: "text-primary",
    },
    {
      key: "mood" as const,
      icon: Heart,
      title: t("progress_overview_cards.emotional_awareness"),
      value: overview.mood.currentAvg === 0
        ? t("progress_overview_cards.start_tracking")
        : overview.mood.trend === "up"
          ? `${t("progress_overview_cards.average_mood")} ↑`
          : overview.mood.trend === "down"
            ? `${t("progress_overview_cards.average_mood")} ↓`
            : `${t("progress_overview_cards.average_mood")} →`,
      subtitle: overview.mood.reflectionDays > 0
        ? `${overview.mood.reflectionDays} ${t("progress_overview_cards.reflections")}`
        : "",
      trend: overview.mood.trend,
      trendColor: overview.mood.trend === "up"
        ? "text-emerald-600 dark:text-emerald-400"
        : overview.mood.trend === "down"
          ? "text-amber-600 dark:text-amber-400"
          : "text-muted-foreground",
    },
  ];

  return (
    <section className="space-y-3 animate-fade-in">
      <div className="grid grid-cols-2 gap-3">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <button
              key={card.key}
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
              <p className={cn("text-sm font-semibold leading-tight", card.trendColor)}>
                {card.value}
              </p>
              {card.subtitle && (
                <p className="text-[10px] text-muted-foreground">{card.subtitle}</p>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
