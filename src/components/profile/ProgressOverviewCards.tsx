import { useState } from "react";
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
  const periodLabel = timeRange === "recent" ? "Last 14 days" : "Last 365 days";
  const vsLabel = timeRange === "recent" ? "rispetto al periodo precedente" : "rispetto al periodo precedente";
  const cards = [
    {
      key: "habits" as const,
      icon: Leaf,
      title: "Abitudini positive",
      value: overview.habits.trend === "stable"
        ? "Stabile"
        : `${overview.habits.trend === "up" ? "+" : "−"}${overview.habits.trendValue}% ${"costanza"}`,
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
      title: "Trigger",
      value: overview.triggers.currentCount === 0 && overview.triggers.previousCount === 0
        ? "Nessun dato"
        : overview.triggers.trend === "up"
          ? `−${overview.triggers.trendValue}% ${"frequenza"}`
          : overview.triggers.trend === "down"
            ? `+${overview.triggers.trendValue}% ${"frequenza"}`
            : "Stabile",
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
      title: "Sfide detox",
      value: `${overview.challenges.completed} ${"completate"} · ${overview.challenges.active} ${"attive"}`,
      subtitle: "",
      trend: "stable" as const,
      trendColor: "text-primary",
    },
    {
      key: "mood" as const,
      icon: Heart,
      title: "Consapevolezza emotiva",
      value: overview.mood.currentAvg === 0
        ? "Inizia a monitorare"
        : overview.mood.trend === "up"
          ? `${"Umore medio"} ↑`
          : overview.mood.trend === "down"
            ? `${"Umore medio"} ↓`
            : `${"Umore medio"} →`,
      subtitle: overview.mood.reflectionDays > 0
        ? `${overview.mood.reflectionDays} ${"riflessioni"}`
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
