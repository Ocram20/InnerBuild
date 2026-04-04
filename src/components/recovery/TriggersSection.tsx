import { useMemo } from "react";
import { Search, Clock, MapPin, Smartphone, Monitor, Bed, MessageSquare, type LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

const GUIDED_IDS = ["emotion", "time", "where", "before"] as const;
const TRIGGER_IDS = ["computer", "phone_bed", "social", "late_nights"] as const;

type GuidedId = (typeof GUIDED_IDS)[number];
type TriggerId = (typeof TRIGGER_IDS)[number];

const GUIDED_ICONS: Record<GuidedId, LucideIcon> = {
  emotion: MessageSquare,
  time: Clock,
  where: MapPin,
  before: Smartphone,
};

const TRIGGER_ICONS: Record<TriggerId, LucideIcon> = {
  computer: Monitor,
  phone_bed: Bed,
  social: Smartphone,
  late_nights: Clock,
};

export function TriggersSection() {
  const { t } = useTranslation();

  const guidedQuestions = useMemo(
    () =>
      GUIDED_IDS.map((id) => ({
        id,
        icon: GUIDED_ICONS[id],
        question: t(`triggers_section.question_${id}`),
        examples: t(`triggers_section.examples_${id}`),
      })),
    [t]
  );

  const commonTriggers = useMemo(
    () =>
      TRIGGER_IDS.map((id) => ({
        id,
        icon: TRIGGER_ICONS[id],
        trigger: t(`triggers_section.trigger_${id}`),
        tip: t(`triggers_section.tip_${id}`),
      })),
    [t]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5 text-primary" />
          {t("triggers_section.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <p className="text-muted-foreground text-sm mb-4">{t("triggers_section.description")}</p>

          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">{t("triggers_section.ask_questions")}</p>
            {guidedQuestions.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.id} className="p-3 rounded-lg bg-muted/30 border border-border/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="h-4 w-4 text-primary" />
                    <p className="font-medium text-foreground text-sm">{item.question}</p>
                  </div>
                  <p className="text-xs text-muted-foreground pl-6">{item.examples}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-foreground mb-3">{t("triggers_section.common_triggers_heading")}</p>
          <div className="grid gap-2">
            {commonTriggers.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20"
                >
                  <Icon className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-foreground text-sm">{item.trigger}</p>
                    <p className="text-xs text-muted-foreground">→ {item.tip}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
