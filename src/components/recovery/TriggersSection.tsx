import { Search, Clock, MapPin, Smartphone, Monitor, Bed, MessageSquare } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const guidedQuestions = [
  {
    icon: MessageSquare,
    question: "What emotion was I feeling?",
    examples: "Bored, lonely, stressed, anxious, tired, rejected, frustrated",
  },
  {
    icon: Clock,
    question: "What time of day was it?",
    examples: "Late night, early morning, after work, weekend afternoon",
  },
  {
    icon: MapPin,
    question: "Where was I?",
    examples: "Bedroom, bathroom, home alone, hotel room",
  },
  {
    icon: Smartphone,
    question: "What was I doing before?",
    examples: "Scrolling social media, watching TV, working, arguing with someone",
  },
];

const commonTriggers = [
  {
    icon: Monitor,
    trigger: "Alone at the computer",
    tip: "Work in public spaces or with the door open",
  },
  {
    icon: Bed,
    trigger: "Phone in bed at night",
    tip: "Charge your phone in another room",
  },
  {
    icon: Smartphone,
    trigger: "Social media browsing",
    tip: "Limit or delete triggering apps",
  },
  {
    icon: Clock,
    trigger: "Late nights when tired",
    tip: "Set a strict bedtime and stick to it",
  },
];

export function TriggersSection() {
  const { t } = useTranslation();

  const guidedQuestions = [
    {
      icon: MessageSquare,
      question: t("triggers_section.question_emotion", "What emotion was I feeling?"),
      examples: t("triggers_section.examples_emotion", "Bored, lonely, stressed, anxious, tired, rejected, frustrated"),
    },
    {
      icon: Clock,
      question: t("triggers_section.question_time", "What time of day was it?"),
      examples: t("triggers_section.examples_time", "Late night, early morning, after work, weekend afternoon"),
    },
    {
      icon: MapPin,
      question: t("triggers_section.question_where", "Where was I?"),
      examples: t("triggers_section.examples_where", "Bedroom, bathroom, home alone, hotel room"),
    },
    {
      icon: Smartphone,
      question: t("triggers_section.question_before", "What was I doing before?"),
      examples: t("triggers_section.examples_before", "Scrolling social media, watching TV, working, arguing with someone"),
    },
  ];

  const commonTriggers = [
    {
      icon: Monitor,
      trigger: t("triggers_section.trigger_computer", "Alone at the computer"),
      tip: t("triggers_section.tip_computer", "Work in public spaces or with the door open"),
    },
    {
      icon: Bed,
      trigger: t("triggers_section.trigger_phone_bed", "Phone in bed at night"),
      tip: t("triggers_section.tip_phone_bed", "Charge your phone in another room"),
    },
    {
      icon: Smartphone,
      trigger: t("triggers_section.trigger_social", "Social media browsing"),
      tip: t("triggers_section.tip_social", "Limit or delete triggering apps"),
    },
    {
      icon: Clock,
      trigger: t("triggers_section.trigger_late_nights", "Late nights when tired"),
      tip: t("triggers_section.tip_late_nights", "Set a strict bedtime and stick to it"),
    },
  ];

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
          <p className="text-muted-foreground text-sm mb-4">
            {t("triggers_section.description")}
          </p>
          
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">{t("triggers_section.ask_questions")}</p>
            {guidedQuestions.map((item) => (
              <div 
                key={item.question}
                className="p-3 rounded-lg bg-muted/30 border border-border/50"
              >
                <div className="flex items-center gap-2 mb-1">
                  <item.icon className="h-4 w-4 text-primary" />
                  <p className="font-medium text-foreground text-sm">{item.question}</p>
                </div>
                <p className="text-xs text-muted-foreground pl-6">{item.examples}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-foreground mb-3">{t("triggers_section.common_triggers_heading")}</p>
          <div className="grid gap-2">
            {commonTriggers.map((item) => (
              <div 
                key={item.trigger}
                className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20"
              >
                <item.icon className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-foreground text-sm">{item.trigger}</p>
                  <p className="text-xs text-muted-foreground">→ {item.tip}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
