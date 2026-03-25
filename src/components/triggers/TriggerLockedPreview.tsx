import { Lock, Zap, BarChart3, Brain, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function TriggerLockedPreview() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const features = [
    { icon: Zap, label: t("locked_preview.trigger.log_triggers") },
    { icon: BarChart3, label: t("locked_preview.trigger.visual_heatmap") },
    { icon: Brain, label: t("locked_preview.trigger.ai_insights") },
    { icon: Clock, label: t("locked_preview.trigger.track_timing") },
  ];

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 space-y-8">
      <div className="w-full max-w-md space-y-3 relative">
        <p className="text-sm text-muted-foreground text-center mb-4">
          {t("locked_preview.trigger.preview_text")}
        </p>
        <Card className="bg-card/30 backdrop-blur border-border/50 overflow-hidden">
          <CardContent className="p-4 blur-[2px] select-none">
            <div className="grid grid-cols-7 gap-1 mb-4">
              {Array.from({ length: 28 }).map((_, i) => (
                <div key={i} className={`h-6 rounded ${
                  i % 5 === 0 ? "bg-red-500/60" : i % 3 === 0 ? "bg-orange-500/50" : i % 2 === 0 ? "bg-yellow-500/40" : "bg-muted/30"
                }`} />
              ))}
            </div>
          </CardContent>
        </Card>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </div>

      <Card className="max-w-md w-full bg-card/50 backdrop-blur border-border/50">
        <CardContent className="pt-8 pb-6 text-center space-y-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Zap className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">{t("trigger_tracking.title")}</h2>
            <p className="text-muted-foreground text-sm">{t("locked_preview.trigger.description")}</p>
          </div>
          <div className="flex flex-col gap-2 py-4">
            {features.map((feature) => (
              <div key={feature.label} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 text-sm">
                <feature.icon className="h-4 w-4 text-primary shrink-0" />
                <span className="text-muted-foreground">{feature.label}</span>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-1">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-lg font-semibold">€9.99</span>
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
