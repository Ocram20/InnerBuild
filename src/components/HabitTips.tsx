import { useState, useEffect } from "react";
import { Lightbulb, X, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

const tipKeys = [
  { titleKey: "habit_tips.tips.start_small_title", contentKey: "habit_tips.tips.start_small" },
  { titleKey: "habit_tips.tips.stack_title", contentKey: "habit_tips.tips.stack" },
  { titleKey: "habit_tips.tips.environment_title", contentKey: "habit_tips.tips.environment" },
  { titleKey: "habit_tips.tips.never_miss_title", contentKey: "habit_tips.tips.never_miss" },
  { titleKey: "habit_tips.tips.track_title", contentKey: "habit_tips.tips.track" },
  { titleKey: "habit_tips.tips.reward_title", contentKey: "habit_tips.tips.reward" },
  { titleKey: "habit_tips.tips.specific_title", contentKey: "habit_tips.tips.specific" },
  { titleKey: "habit_tips.tips.identity_title", contentKey: "habit_tips.tips.identity" },
  { titleKey: "habit_tips.tips.rule_title", contentKey: "habit_tips.tips.rule" },
  { titleKey: "habit_tips.tips.friction_title", contentKey: "habit_tips.tips.friction" },
];

export default function HabitTips() {
  const [currentTip, setCurrentTip] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tipKeys.length);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  if (dismissed) return null;

  const tip = tipKeys[currentTip];

  return (
    <div className="glass rounded-xl p-4 shadow-card relative animate-fade-in">
      <button onClick={() => setDismissed(true)} className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted transition-colors">
        <X className="h-3 w-3 text-muted-foreground" />
      </button>
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-lg bg-xp/10 flex items-center justify-center flex-shrink-0">
          <Lightbulb className="h-4 w-4 text-xp" />
        </div>
        <div className="flex-1 min-w-0 pr-4">
          <p className="text-xs text-xp font-medium mb-0.5">{t("habit_tips.one_min_tip")}</p>
          <p className="text-sm font-medium text-foreground">{t(tip.titleKey)}</p>
          <p className="text-xs text-muted-foreground mt-1">{t(tip.contentKey)}</p>
        </div>
      </div>
      <button onClick={() => setCurrentTip((prev) => (prev + 1) % tipKeys.length)} className="mt-3 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
        {t("habit_tips.next_tip")} <ChevronRight className="h-3 w-3" />
      </button>
    </div>
  );
}
