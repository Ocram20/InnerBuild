import { Lock, Brain, Target, Heart, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function LockedPreview() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const features = [
    { icon: Brain, label: t("locked_preview.recovery.science_education") },
    { icon: Target, label: t("locked_preview.recovery.craving_tools") },
    { icon: Shield, label: t("locked_preview.recovery.anti_trigger_plan") },
    { icon: Heart, label: t("locked_preview.recovery.motivation_tracking") },
  ];

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-card/50 backdrop-blur border-border/50">
        <CardContent className="pt-8 pb-6 text-center space-y-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">{t("locked_preview.recovery.title")}</h2>
            <p className="text-muted-foreground text-sm">{t("locked_preview.recovery.description")}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 py-4">
            {features.map((feature) => (
              <div key={feature.label} className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 text-sm">
                <feature.icon className="h-4 w-4 text-primary shrink-0" />
                <span className="text-muted-foreground">{feature.label}</span>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-1">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-lg font-semibold">€4.99</span>
              <span className="text-muted-foreground text-sm">/{t("common.month")}</span>
            </div>
            <Button onClick={() => navigate("/pricing")} className="w-full">
              {t("locked_preview.unlock_premium")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
