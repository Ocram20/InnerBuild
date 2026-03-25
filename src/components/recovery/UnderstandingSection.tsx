import { BookOpen, ChevronDown, AlertTriangle, Brain, Zap, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function UnderstandingSection() {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          {t("understanding_section.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-sm leading-relaxed">
          {t("understanding_section.description")}
        </p>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="super-stimulus">
            <AccordionTrigger className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" />
                {t("understanding_section.super_stimulus_title")}
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-3 pt-2">
              <p>
                {t("understanding_section.super_stimulus_intro_part1")} <strong>{t("understanding_section.super_stimulus_intro_emphasis")}</strong> {t("understanding_section.super_stimulus_intro_part2")}
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>{t("understanding_section.unlimited_novelty_label")}</strong> {t("understanding_section.unlimited_novelty_desc")}</li>
                <li><strong>{t("understanding_section.instant_access_label")}</strong> {t("understanding_section.instant_access_desc")}</li>
                <li><strong>{t("understanding_section.extreme_content_label")}</strong> {t("understanding_section.extreme_content_desc")}</li>
              </ul>
              <p>
                {t("understanding_section.super_stimulus_conclusion")}
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="effects">
            <AccordionTrigger className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-500" />
                {t("understanding_section.common_effects_title")}
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-3 pt-2">
              <div className="grid gap-3">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="font-medium text-foreground mb-1">{t("understanding_section.desensitization_label")}</p>
                  <p>{t("understanding_section.desensitization_desc")}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="font-medium text-foreground mb-1">{t("understanding_section.escalation_label")}</p>
                  <p>{t("understanding_section.escalation_desc")}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="font-medium text-foreground mb-1">{t("understanding_section.anxiety_label")}</p>
                  <p>{t("understanding_section.anxiety_desc")}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="font-medium text-foreground mb-1">{t("understanding_section.concentration_label")}</p>
                  <p>{t("understanding_section.concentration_desc")}</p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="pied">
            <AccordionTrigger className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-purple-500" />
                {t("understanding_section.sexual_emotional_title")}
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-3 pt-2">
              <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <p className="font-medium text-foreground mb-2">{t("understanding_section.pied_label")}</p>
                <p>
                  {t("understanding_section.pied_desc")}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="font-medium text-foreground mb-2">{t("understanding_section.emotional_disconnection_label")}</p>
                <p>
                  {t("understanding_section.emotional_disconnection_desc")}
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="young-brains">
            <AccordionTrigger className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                {t("understanding_section.young_brains_title")}
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-3 pt-2">
              <p>
                {t("understanding_section.young_brains_intro_part1")} <strong>{t("understanding_section.neuroplasticity")}</strong> {t("understanding_section.young_brains_intro_part2")}
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>{t("understanding_section.young_brains_point1")}</li>
                <li>{t("understanding_section.young_brains_point2")}</li>
                <li>{t("understanding_section.young_brains_point3")}</li>
                <li>{t("understanding_section.young_brains_point4")}</li>
              </ul>
              <p className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 mt-2">
                <strong>{t("understanding_section.good_news_label")}</strong> {t("understanding_section.good_news_desc")}
              
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
