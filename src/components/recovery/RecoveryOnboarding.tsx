import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, ArrowRight, X } from "lucide-react";
import { useTranslation } from "react-i18next";
interface RecoveryOnboardingProps {
  onStart: () => void;
  onDecline: () => void;
}

export function RecoveryOnboarding({ onStart, onDecline }: RecoveryOnboardingProps) {
  const { t } = useTranslation();
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Target className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-xl">{t("recovery.onboarding.title")}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">{t("recovery.onboarding.description")}</p>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            {t("recovery.onboarding.feature_1")}
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            {t("recovery.onboarding.feature_2")}
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            {t("recovery.onboarding.feature_3")}
          </li>
        </ul>
        <div className="flex gap-3 pt-2">
          <Button onClick={onStart} className="flex-1">
            {t("recovery.onboarding.start")}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          <Button variant="outline" onClick={onDecline}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
