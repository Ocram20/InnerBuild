import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Sparkles, Target, Flame, Bot, Heart, BarChart3, Trophy, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { reapplyGoogleTranslate } from "@/lib/googleTranslate";

type PaywallReason = "habit_limit" | "challenge_limit" | "ai_coach" | "recovery" | "advanced_stats" | "general";

interface PaywallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason?: PaywallReason;
}

const reasonIcons: Record<PaywallReason, React.ReactNode> = {
  habit_limit: <Target className="h-6 w-6 text-primary" />,
  challenge_limit: <Flame className="h-6 w-6 text-accent" />,
  ai_coach: <Bot className="h-6 w-6 text-primary" />,
  recovery: <Heart className="h-6 w-6 text-rose-500" />,
  advanced_stats: <BarChart3 className="h-6 w-6 text-primary" />,
  general: <Crown className="h-6 w-6 text-accent" />,
};

const featureKeys = [
  "paywall.features.unlimited_habits", "paywall.features.unlimited_challenges", "paywall.features.ai_coach",
  "paywall.features.recovery", "paywall.features.trigger_tracking", "paywall.features.learn", "paywall.features.priority",
];

export default function PaywallModal({ open, onOpenChange, reason = "general" }: PaywallModalProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const reasonTitleKey = `paywall.${reason}_title`;
  const reasonDescKey = `paywall.${reason}_desc`;

  useEffect(() => {
    if (!open) return;
    reapplyGoogleTranslate();
  }, [open, reason]);

  const handleUpgrade = () => {
    onOpenChange(false);
    navigate("/pricing");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl w-[calc(100%-2rem)] max-w-sm max-h-[85vh] overflow-y-auto">
        <DialogHeader className="text-center space-y-2 sm:space-y-3">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center mx-auto">
            {reasonIcons[reason]}
          </div>
          <DialogTitle className="text-lg sm:text-xl">{t(reasonTitleKey)}</DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">{t(reasonDescKey)}</DialogDescription>
        </DialogHeader>

        <div className="my-3 sm:my-4 p-3 sm:p-4 rounded-xl bg-muted/50 border border-border/50">
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <Sparkles className="h-4 w-4 text-accent" />
            <span className="font-medium text-foreground text-sm">{t("paywall.premium_includes")}</span>
          </div>
          <ul className="space-y-1.5 sm:space-y-2">
            {featureKeys.map((key, i) => (
              <li key={i} className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                {t(key)}
              </li>
            ))}
          </ul>
        </div>

        <div className="text-center mb-2">
          <span className="text-2xl sm:text-3xl font-bold text-foreground">€9.99</span>
          <span className="text-muted-foreground text-sm">/{t("pricing.per_month").replace(/^\//, "")}</span>
        </div>

        <div className="flex flex-col gap-2">
          <Button onClick={handleUpgrade} className="w-full gradient-accent text-accent-foreground rounded-xl shadow-soft h-10 sm:h-11">
            <Crown className="h-4 w-4 mr-2" />{t("paywall.upgrade_to_premium")}
          </Button>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="w-full rounded-xl text-muted-foreground h-9 sm:h-10">
            {t("paywall.maybe_later")}
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground mt-1 sm:mt-2">{t("paywall.cancel_guarantee")}</p>
      </DialogContent>
    </Dialog>
  );
}
