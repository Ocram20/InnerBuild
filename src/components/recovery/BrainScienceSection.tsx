import { Brain, TrendingUp, RefreshCw, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function BrainScienceSection() {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          {t("brain_science_section.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="wanting-liking">
            <AccordionTrigger className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-amber-500" />
                {t("brain_science_section.wanting_vs_liking")}
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-3 pt-2">
              <p>
                {t("brain_science_section.reward_system_intro")}
              </p>
              <div className="grid gap-3">
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <p className="font-medium text-foreground mb-1">
                    <span className="text-amber-500">{t("brain_science_section.wanting_label")}</span> ({t("brain_science_section.wanting_parenthesis")})
                  </p>
                  <p>
                    {t("brain_science_section.wanting_desc")}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <p className="font-medium text-foreground mb-1">
                    <span className="text-emerald-500">{t("brain_science_section.liking_label")}</span> ({t("brain_science_section.liking_parenthesis")})
                  </p>
                  <p>
                    {t("brain_science_section.liking_desc")}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground/80 italic">
                {t("brain_science_section.wanting_liking_quote")}
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="escalation">
            <AccordionTrigger className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-rose-500" />
                {t("brain_science_section.novelty_title")}
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-3 pt-2">
              <p>
                {t("brain_science_section.novelty_desc_part1")} <strong>{t("brain_science_section.novelty_highlight")}</strong> {t("brain_science_section.novelty_desc_part2")}
              </p>
              <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                  <p className="font-medium text-foreground">{t("brain_science_section.escalation_cycle_label")}</p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>{t("brain_science_section.escalation_step1")}</li>
                  <li>{t("brain_science_section.escalation_step2")}</li>
                  <li>{t("brain_science_section.escalation_step3")}</li>
                  <li>{t("brain_science_section.escalation_step4")}</li>
                </ol>
              </div>
              <p>
                {t("brain_science_section.novelty_conclusion")}
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="reboot">
            <AccordionTrigger className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-emerald-500" />
                {t("brain_science_section.reboot_title")}
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-3 pt-2">
              <p>
                {t("brain_science_section.reboot_intro_part1")} <strong>{t("brain_science_section.reset_dopamine")}</strong> {t("brain_science_section.reboot_intro_part2")}
              </p>
              <div className="grid gap-2">
                <div className="flex items-center gap-3 p-2 rounded-lg bg-emerald-500/10">
                  <Sparkles className="h-4 w-4 text-emerald-500 shrink-0" />
                  <div>
                    <p className="font-medium text-foreground text-sm">{t("brain_science_section.improved_mood_label")}</p>
                    <p className="text-xs">{t("brain_science_section.improved_mood_desc")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-lg bg-blue-500/10">
                  <Sparkles className="h-4 w-4 text-blue-500 shrink-0" />
                  <div>
                    <p className="font-medium text-foreground text-sm">{t("brain_science_section.better_focus_label")}</p>
                    <p className="text-xs">{t("brain_science_section.better_focus_desc")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-lg bg-purple-500/10">
                  <Sparkles className="h-4 w-4 text-purple-500 shrink-0" />
                  <div>
                    <p className="font-medium text-foreground text-sm">{t("brain_science_section.healthy_sexual_label")}</p>
                    <p className="text-xs">{t("brain_science_section.healthy_sexual_desc")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-lg bg-amber-500/10">
                  <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
                  <div>
                    <p className="font-medium text-foreground text-sm">{t("brain_science_section.more_energy_label")}</p>
                    <p className="text-xs">{t("brain_science_section.more_energy_desc")}</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground/80 p-2 bg-muted/30 rounded-lg">
                <strong>{t("brain_science_section.timeline_label")}</strong> {t("brain_science_section.timeline_desc")}
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
