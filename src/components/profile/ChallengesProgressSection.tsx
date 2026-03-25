import { Shield, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import type { ChallengeProgressDetail } from "@/hooks/useProgressData";

interface Props {
  challenges: ChallengeProgressDetail[];
}

export function ChallengesProgressSection({ challenges }: Props) {
  const { t } = useTranslation();

  if (challenges.length === 0) {
    return (
      <div className="glass rounded-2xl p-6 text-center animate-fade-in">
        <Shield className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">{t("challenges_progress_section.no_challenges_yet")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 animate-fade-in">
      {/* Vertical timeline */}
      <div className="relative pl-6">
        {/* Timeline line */}
        <div className="absolute left-2.5 top-2 bottom-2 w-px bg-border" />

        {challenges.map((c, i) => {
          const isCompleted = c.status === "completed";
          const progress = Math.min(Math.round((c.daysResisted / c.durationDays) * 100), 100);

          return (
            <div
              key={c.id}
              className="relative mb-4 last:mb-0 animate-slide-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {/* Timeline dot */}
              <div
                className={cn(
                  "absolute -left-3.5 top-3 w-5 h-5 rounded-full flex items-center justify-center border-2",
                  isCompleted
                    ? "bg-primary border-primary"
                    : "bg-background border-primary/40"
                )}
              >
                {isCompleted && <CheckCircle2 className="h-3 w-3 text-primary-foreground" />}
                {!isCompleted && <div className="w-2 h-2 rounded-full bg-primary/60" />}
              </div>

              {/* Card */}
              <div className="glass rounded-xl p-4 ml-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{c.title}</p>
                    <p className="text-[10px] text-muted-foreground capitalize">{c.category.replace("_", " ")}</p>
                  </div>
                  {isCompleted ? (
                    <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full whitespace-nowrap">
                      {t("challenges_progress_section.completed")}
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-accent bg-accent/10 px-2 py-0.5 rounded-full whitespace-nowrap">
                      {t("challenges_progress_section.active")}
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                    <span>{t("challenges_progress_section.days", { count: c.daysResisted })}</span>
                    <span>{t("challenges_progress_section.days_goal", { completed: c.durationDays })}</span>
                  </div>
                  <div className="h-1.5 bg-muted/60 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-700",
                        isCompleted ? "bg-primary" : "bg-accent/70"
                      )}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
