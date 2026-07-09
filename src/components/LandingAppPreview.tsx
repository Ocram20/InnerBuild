import { Flame, Check, Bot, TrendingUp, Leaf } from "lucide-react";
import { useTranslation } from "react-i18next";

/**
 * A stylized, non-interactive mockup of the InnerBuild mobile app,
 * shown inside a phone frame on the landing hero. Purely decorative:
 * it communicates "this is really a mobile app" without shipping real data.
 */
export default function LandingAppPreview() {
  const { t } = useTranslation();

  const habits = [
    { label: t("landing.preview.habit_meditate", "Morning meditation"), done: true },
    { label: t("landing.preview.habit_workout", "Workout"), done: true },
    { label: t("landing.preview.habit_read", "Read 10 pages"), done: false },
  ];

  return (
    <div className="relative mx-auto w-[260px] sm:w-[300px] select-none" aria-hidden="true">
      {/* Phone frame */}
      <div className="relative rounded-[2.75rem] border border-border/70 bg-card p-2.5 shadow-2xl premium-ring">
        <div className="overflow-hidden rounded-[2.25rem] bg-background">
          {/* Status bar */}
          <div className="flex items-center justify-between px-6 pt-3 pb-1 text-[10px] font-medium text-foreground/70">
            <span>9:41</span>
            <div className="h-5 w-20 rounded-full bg-foreground/10" />
            <span>100%</span>
          </div>

          {/* App content */}
          <div className="px-4 pb-6 pt-2">
            {/* Greeting */}
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-muted-foreground">
                  {t("landing.preview.greeting", "Good morning")}
                </p>
                <p className="text-base font-bold text-foreground">Alex</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary shadow-soft">
                <Leaf className="h-4 w-4 text-primary-foreground" />
              </div>
            </div>

            {/* Streak hero card */}
            <div className="mb-3 overflow-hidden rounded-2xl gradient-primary p-4 text-primary-foreground shadow-soft">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4" />
                <span className="text-[11px] font-medium opacity-90">
                  {t("landing.preview.current_streak", "Current streak")}
                </span>
              </div>
              <div className="mt-1 flex items-end gap-1">
                <span className="text-3xl font-extrabold leading-none">27</span>
                <span className="mb-0.5 text-xs opacity-90">
                  {t("landing.preview.days", "days")}
                </span>
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-primary-foreground/25">
                <div className="h-full w-4/5 rounded-full bg-primary-foreground/90" />
              </div>
            </div>

            {/* Habit list */}
            <div className="mb-3 space-y-2">
              {habits.map((h) => (
                <div
                  key={h.label}
                  className="flex items-center gap-3 rounded-xl border border-border/60 bg-card px-3 py-2.5"
                >
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-md border ${
                      h.done
                        ? "border-transparent bg-primary text-primary-foreground"
                        : "border-border"
                    }`}
                  >
                    {h.done && <Check className="h-3 w-3" strokeWidth={3} />}
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      h.done ? "text-muted-foreground line-through" : "text-foreground"
                    }`}
                  >
                    {h.label}
                  </span>
                </div>
              ))}
            </div>

            {/* AI coach pill */}
            <div className="flex items-center gap-2.5 rounded-xl border border-accent/30 bg-accent/10 px-3 py-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/20">
                <Bot className="h-4 w-4 text-accent-foreground/80" />
              </div>
              <span className="text-[11px] leading-snug text-foreground/80">
                {t("landing.preview.coach_tip", "You're on track. Keep the momentum going.")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating stat chip */}
      <div className="absolute -right-4 top-24 hidden rounded-2xl border border-border/70 bg-card/95 px-3 py-2 shadow-xl backdrop-blur sm:flex animate-float">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold leading-none text-foreground">+38%</p>
            <p className="text-[9px] text-muted-foreground">
              {t("landing.preview.consistency", "consistency")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
