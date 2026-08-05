import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Clock,
  MapPin,
  Smartphone,
  Monitor,
  Bed,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Filter,
  Eye,
  ArrowRight,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

type CategoryFilter = "all" | "guided" | "common";

interface GuidedQuestion {
  id: string;
  icon: LucideIcon;
  category: string;
  question: string;
  examples: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

interface CommonTrigger {
  id: string;
  icon: LucideIcon;
  trigger: string;
  tip: string;
  badge: string;
  color: string;
  bgColor: string;
}

export function TriggersSection() {
  const { t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>("all");
  const [identifiedTriggers, setIdentifiedTriggers] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const guidedQuestions: GuidedQuestion[] = useMemo(
    () => [
      {
        id: "emotion",
        icon: MessageSquare,
        category: t("triggers_section.category_emotion", "Stato Emotivo"),
        question: t("triggers_section.question_emotion", "Cosa provi prima del craving?"),
        examples: t("triggers_section.examples_emotion", "Noia, solitudine, stress, frustrazione, stanchezza mentale"),
        color: "text-[#4D87D9] dark:text-[#619BF0]",
        bgColor: "bg-[#4D87D9]/10",
        borderColor: "border-[#4D87D9]/20",
      },
      {
        id: "time",
        icon: Clock,
        category: t("triggers_section.category_time", "Orario & Routine"),
        question: t("triggers_section.question_time", "In quali orari sei più vulnerabile?"),
        examples: t("triggers_section.examples_time", "Tarda sera, notte prima di dormire, weekend senza piani"),
        color: "text-[#4b9b75] dark:text-[#5ec396]",
        bgColor: "bg-[#4b9b75]/10",
        borderColor: "border-[#4b9b75]/20",
      },
      {
        id: "where",
        icon: MapPin,
        category: t("triggers_section.category_where", "Ambiente Fisico"),
        question: t("triggers_section.question_where", "Dove ti trovi solitamente?"),
        examples: t("triggers_section.examples_where", "In camera da solo, al computer a porte chiuse, nel letto"),
        color: "text-[#4b9b75] dark:text-[#5ec396]",
        bgColor: "bg-[#4b9b75]/10",
        borderColor: "border-[#4b9b75]/20",
      },
      {
        id: "before",
        icon: Smartphone,
        category: t("triggers_section.category_before", "Azione Precedente"),
        question: t("triggers_section.question_before", "Cosa fai subito prima dell'impulso?"),
        examples: t("triggers_section.examples_before", "Scroll infinito sui social, navigare senza meta, isolamento"),
        color: "text-[#4D87D9] dark:text-[#619BF0]",
        bgColor: "bg-[#4D87D9]/10",
        borderColor: "border-[#4D87D9]/20",
      },
    ],
    [t]
  );

  const commonTriggers: CommonTrigger[] = useMemo(
    () => [
      {
        id: "computer",
        icon: Monitor,
        trigger: t("triggers_section.trigger_computer", "PC in camera da solo di notte"),
        tip: t("triggers_section.tip_computer", "Sposta il computer in un'area comune o usa spegnimento programmato"),
        badge: t("triggers_section.badge_env", "Ambiente"),
        color: "text-[#4D87D9] dark:text-[#619BF0]",
        bgColor: "bg-[#4D87D9]/10",
      },
      {
        id: "phone_bed",
        icon: Bed,
        trigger: t("triggers_section.trigger_phone_bed", "Smartphone a letto prima di dormire"),
        tip: t("triggers_section.tip_phone_bed", "Lascia il telefono in carica lontano dal letto o in un'altra stanza"),
        badge: t("triggers_section.badge_device", "Dispositivo"),
        color: "text-[#4D87D9] dark:text-[#619BF0]",
        bgColor: "bg-[#4D87D9]/10",
      },
      {
        id: "social",
        icon: Smartphone,
        trigger: t("triggers_section.trigger_social", "Scroll compulsivo & Stimolazione social"),
        tip: t("triggers_section.tip_social", "Imposta limiti di tempo o usa blocchi app dopo 15 minuti di uso"),
        badge: t("triggers_section.badge_habit", "Abitudine"),
        color: "text-[#4D87D9] dark:text-[#619BF0]",
        bgColor: "bg-[#4D87D9]/10",
      },
      {
        id: "late_nights",
        icon: Clock,
        trigger: t("triggers_section.trigger_late_nights", "Stanchezza & Notti in bianco"),
        tip: t("triggers_section.tip_late_nights", "Imposta una sveglia serale per andare a dormire a orario fisso"),
        badge: t("triggers_section.badge_physiological", "Fisiologico"),
        color: "text-[#4b9b75] dark:text-[#5ec396]",
        bgColor: "bg-[#4b9b75]/10",
      },
    ],
    [t]
  );

  const toggleIdentified = (id: string) => {
    setIdentifiedTriggers((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const titleText = t("triggers_section.title", "Identificare i Trigger");
  const descText = t(
    "triggers_section.description",
    "Mappa i tuoi fattori scatenanti emotivi, ambientali e temporali per disinnescare l'automatismo prima che nasca l'impulso."
  );

  return (
    <Card className="border-border/60 bg-card/80 backdrop-blur-md shadow-xl overflow-hidden rounded-2xl">
      <CardHeader className="pb-3 pt-5 px-4 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2.5 text-base sm:text-lg font-bold text-foreground">
            <div className="p-2 rounded-xl bg-[#4D87D9]/10 text-[#4D87D9] dark:text-[#619BF0] border border-[#4D87D9]/20 shadow-[0_0_12px_rgba(77,135,217,0.15)]">
              <Search className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <span>{titleText}</span>
          </CardTitle>

          <Badge variant="outline" className="bg-[#4D87D9]/10 text-[#4D87D9] dark:text-[#619BF0] border-[#4D87D9]/30 text-xs font-semibold px-2.5 py-0.5">
            {t("triggers_section.recognized", { count: identifiedTriggers.length, defaultValue: `${identifiedTriggers.length} Riconosciuti` })}
          </Badge>
        </div>

        <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 leading-relaxed">
          {descText}
        </p>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-1.5 mt-4 overflow-x-auto pb-1 scrollbar-none">
          <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0 mr-1" />
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-all shrink-0 ${
              activeFilter === "all"
                ? "bg-[#4D87D9] dark:bg-[#619BF0] text-white shadow-md font-semibold"
                : "bg-[#252d37]/50 text-[#6c8093] hover:text-foreground"
            }`}
          >
            {t("triggers_section.filter_all", { count: guidedQuestions.length + commonTriggers.length, defaultValue: `Tutti (${guidedQuestions.length + commonTriggers.length})` })}
          </button>
          <button
            onClick={() => setActiveFilter("guided")}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-all shrink-0 ${
              activeFilter === "guided"
                ? "bg-[#4D87D9] dark:bg-[#619BF0] text-white shadow-md font-semibold"
                : "bg-[#252d37]/50 text-[#6c8093] hover:text-foreground"
            }`}
          >
            {t("triggers_section.filter_guided", { count: guidedQuestions.length, defaultValue: `Domande Guida (${guidedQuestions.length})` })}
          </button>
          <button
            onClick={() => setActiveFilter("common")}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-all shrink-0 ${
              activeFilter === "common"
                ? "bg-[#4D87D9] dark:bg-[#619BF0] text-white shadow-md font-semibold"
                : "bg-[#252d37]/50 text-[#6c8093] hover:text-foreground"
            }`}
          >
            {t("triggers_section.filter_common", { count: commonTriggers.length, defaultValue: `Pattern Comuni (${commonTriggers.length})` })}
          </button>
        </div>
      </CardHeader>

      <CardContent className="px-4 sm:px-6 pb-5 pt-2 space-y-6">
        {/* Section 1: Domande Guida */}
        {(activeFilter === "all" || activeFilter === "guided") && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#4D87D9] dark:text-[#619BF0] flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5" />
                <span>{t("triggers_section.ask_questions", "Domande Guida per la Consapevolezza")}</span>
              </p>
              <span className="text-[11px] text-muted-foreground">{t("triggers_section.tap_for_details", "Tocca per dettagli")}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {guidedQuestions.map((item) => {
                const Icon = item.icon;
                const isExpanded = expandedId === item.id;

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      item.bgColor
                    } ${item.borderColor} hover:border-[#4D87D9]/40 relative overflow-hidden`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${item.bgColor} ${item.color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                          {item.category}
                        </span>
                      </div>
                      <Sparkles className="h-3.5 w-3.5 text-muted-foreground/40" />
                    </div>

                    <p className="font-semibold text-foreground text-xs sm:text-sm mt-2 leading-snug">
                      {item.question}
                    </p>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.15 }}
                          className="mt-2.5 pt-2 border-t border-border/40 text-xs text-muted-foreground space-y-1"
                        >
                          <p className="font-medium text-foreground/80 flex items-center gap-1">
                            <ArrowRight className="h-3 w-3 text-[#4D87D9] dark:text-[#619BF0] shrink-0" /> {t("triggers_section.examples_to_observe", "Esempi da osservare:")}
                          </p>
                          <p className="pl-4 italic">{item.examples}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {!isExpanded && (
                      <p className="text-[11px] text-muted-foreground/70 truncate mt-1 pl-0.5">
                        {item.examples}
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Section 2: Trigger Comuni e Soluzioni */}
        {(activeFilter === "all" || activeFilter === "common") && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#4b9b75] dark:text-[#5ec396] flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5" />
                <span>{t("triggers_section.common_triggers_heading", "Trigger Comuni & Contromisure")}</span>
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {commonTriggers.map((item) => {
                const Icon = item.icon;
                const isIdentified = identifiedTriggers.includes(item.id);

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isIdentified
                        ? "bg-[#4D87D9]/10 border-[#4D87D9]/50 shadow-[0_0_15px_rgba(77,135,217,0.12)]"
                        : "bg-muted/20 border-border/40 hover:border-border/80"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-xl mt-0.5 ${item.bgColor} ${item.color} shrink-0`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground text-xs sm:text-sm">
                              {item.trigger}
                            </span>
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-normal">
                              {item.badge}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5 leading-relaxed">
                            <span className="text-[#4b9b75] dark:text-[#5ec396] font-semibold shrink-0">→ {t("triggers_section.solution_label", "Soluzione:")}</span>
                            {item.tip}
                          </p>
                        </div>
                      </div>

                      <Button
                        variant={isIdentified ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleIdentified(item.id)}
                        className={`h-8 text-xs shrink-0 gap-1 rounded-lg transition-all ${
                          isIdentified
                            ? "bg-[#4D87D9] dark:bg-[#619BF0] hover:bg-[#4D87D9]/90 text-white font-semibold"
                            : "border-border/60 hover:bg-muted text-muted-foreground"
                        }`}
                      >
                        <CheckCircle2 className={`h-3.5 w-3.5 ${isIdentified ? "text-white" : "text-muted-foreground"}`} />
                        <span>{isIdentified ? t("triggers_section.identified_btn", "Identificato") : t("triggers_section.report_btn", "Segnala")}</span>
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom Banner */}
        <div className="p-3 rounded-xl bg-[#4D87D9]/10 border border-[#4D87D9]/20 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#4D87D9] dark:text-[#619BF0] shrink-0" />
            <span className="text-muted-foreground">
              <strong className="text-foreground">{t("triggers_section.neuro_tip_title", "Suggerimento Neuroscienze:")}</strong> {t("triggers_section.neuro_tip_desc", "Riconoscere il trigger attiva la corteccia prefrontale, riducendo l'impulso fino al 50%.")}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
