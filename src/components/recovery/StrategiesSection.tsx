import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lightbulb,
  Shield,
  MapPin,
  Flame,
  Dumbbell,
  Brain,
  PenLine,
  Users,
  TreePine,
  Gamepad2,
  Moon,
  Heart,
  Home,
  User,
  ArrowRight,
  BookOpen,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

type CategoryKey = "env" | "mind" | "body" | "social";

const CATEGORIES: { id: CategoryKey; label: string; icon: LucideIcon }[] = [
  { id: "env", label: "Ambiente", icon: Home },
  { id: "mind", label: "Mente", icon: Brain },
  { id: "body", label: "Corpo", icon: Dumbbell },
  { id: "social", label: "Sociale", icon: Users },
];

const STRATEGY_CATEGORY_MAP: Record<string, CategoryKey> = {
  remove_access: "env",
  change_env: "env",
  track_streak: "social",
  exercise: "body",
  meditation: "mind",
  cold_showers: "body",
  journaling: "mind",
  social: "social",
  nature: "social",
  hobbies: "social",
  prioritize_sleep: "body",
  self_compassion: "mind",
};

const STRATEGY_IDS = [
  "remove_access",
  "change_env",
  "track_streak",
  "exercise",
  "meditation",
  "cold_showers",
  "journaling",
  "social",
  "nature",
  "hobbies",
  "prioritize_sleep",
  "self_compassion",
] as const;

type StrategyId = (typeof STRATEGY_IDS)[number];

const STRATEGY_ICONS: Record<StrategyId, LucideIcon> = {
  remove_access: Shield,
  change_env: MapPin,
  track_streak: Flame,
  exercise: Dumbbell,
  meditation: Brain,
  cold_showers: Dumbbell,
  journaling: PenLine,
  social: Users,
  nature: TreePine,
  hobbies: Gamepad2,
  prioritize_sleep: Moon,
  self_compassion: Heart,
};

const STRATEGY_STYLES: Record<StrategyId, { color: string; bgColor: string }> = {
  remove_access: { color: "text-[#4D87D9] dark:text-[#619BF0]", bgColor: "bg-[#4D87D9]/10" },
  change_env: { color: "text-[#4D87D9] dark:text-[#619BF0]", bgColor: "bg-[#4D87D9]/10" },
  track_streak: { color: "text-[#4b9b75] dark:text-[#5ec396]", bgColor: "bg-[#4b9b75]/10" },
  exercise: { color: "text-[#4b9b75] dark:text-[#5ec396]", bgColor: "bg-[#4b9b75]/10" },
  meditation: { color: "text-[#C377D7] dark:text-[#D28CE4]", bgColor: "bg-[#C377D7]/10" },
  cold_showers: { color: "text-[#4b9b75] dark:text-[#5ec396]", bgColor: "bg-[#4b9b75]/10" },
  journaling: { color: "text-[#C377D7] dark:text-[#D28CE4]", bgColor: "bg-[#C377D7]/10" },
  social: { color: "text-[#6c8093]", bgColor: "bg-[#6c8093]/10" },
  nature: { color: "text-[#4b9b75] dark:text-[#5ec396]", bgColor: "bg-[#4b9b75]/10" },
  hobbies: { color: "text-[#C377D7] dark:text-[#D28CE4]", bgColor: "bg-[#C377D7]/10" },
  prioritize_sleep: { color: "text-[#4b9b75] dark:text-[#5ec396]", bgColor: "bg-[#4b9b75]/10" },
  self_compassion: { color: "text-[#C377D7] dark:text-[#D28CE4]", bgColor: "bg-[#C377D7]/10" },
};

export function StrategiesSection() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("env");

  const filteredStrategies = useMemo(() => {
    return STRATEGY_IDS.filter((id) => STRATEGY_CATEGORY_MAP[id] === activeCategory)
      .slice(0, 3)
      .map((id) => ({
        id,
        icon: STRATEGY_ICONS[id],
        title: t(`strategies_section.${id}_title`),
        description: t(`strategies_section.${id}_desc`),
        ...STRATEGY_STYLES[id],
      }));
  }, [activeCategory, t]);

  return (
    <div className="space-y-4">
      {/* Category Strategies Card */}
      <Card className="border-border/60 bg-card/80 backdrop-blur-md shadow-xl overflow-hidden">
        <CardHeader className="pb-3 pt-5 px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-bold text-foreground">
              <div className="p-1.5 rounded-lg bg-[#C377D7]/10 text-[#C377D7] dark:text-[#D28CE4] border border-[#C377D7]/20">
                <Lightbulb className="h-4 w-4" />
              </div>
              <span>{t("strategies_section.title", "Strategie di Recupero")}</span>
            </CardTitle>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {t("strategies_section.description", "Seleziona una categoria per visualizzare micro-azioni pratiche e mirate.")}
          </p>

          {/* 4 Category Pill Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-3 pb-1">
            {CATEGORIES.map((cat) => {
              const CatIcon = cat.icon;
              const isActive = activeCategory === cat.id;

              return (
                <motion.button
                  key={cat.id}
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                    isActive
                      ? "bg-[#C377D7] dark:bg-[#D28CE4] text-white shadow-md border border-purple-400/40"
                      : "bg-[#252d37]/50 text-[#6c8093] hover:text-foreground border border-border/50"
                  }`}
                >
                  <CatIcon className="h-3.5 w-3.5" />
                  <span>{t(`strategies_section.category.${cat.id}`, cat.label)}</span>
                </motion.button>
              );
            })}
          </div>
        </CardHeader>

        <CardContent className="px-4 sm:px-6 pb-5 pt-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="grid gap-2.5"
            >
              {filteredStrategies.map((strategy) => {
                const Icon = strategy.icon;
                return (
                  <div
                    key={strategy.id}
                    className="flex items-start gap-3 p-3 rounded-2xl bg-[#192028]/60 border border-border/50 hover:border-[#8b5cf6]/30 transition-colors"
                  >
                    <div className={`p-2 rounded-xl ${strategy.bgColor} shrink-0 mt-0.5`}>
                      <Icon className={`h-4 w-4 ${strategy.color}`} />
                    </div>
                    <div>
                      <p className="font-semibold text-xs sm:text-sm text-foreground">{strategy.title}</p>
                      <p className="text-[11px] sm:text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-snug">
                        {strategy.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}

export function LearnGuideCTACard() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, delay: 0.15 }}
    >
      <Card className="relative border-[#8b5cf6]/40 bg-gradient-to-br from-[#192028] via-[#192028] to-[#192028] backdrop-blur-xl shadow-2xl overflow-hidden p-5 sm:p-6 text-foreground rounded-2xl">
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#8b5cf6]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1 max-w-lg">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#8b5cf6]/20 text-[#8b5cf6] dark:text-[#9b5bdb] border border-[#8b5cf6]/30 mb-1">
              <BookOpen className="h-3 w-3" />
              {t("strategies_section.complete_guide", "Guida Completa")}
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              {t("strategies_section.deep_dive_title", "Vuoi approfondire la scienza del recupero?")}
            </h3>
            <p className="text-xs sm:text-sm text-[#6c8093]">
              {t("strategies_section.deep_dive_desc", "Leggi le guide complete, gli studi neuroscientifici e gli articoli dedicati.")}
            </p>
          </div>

          <motion.div whileTap={{ scale: 0.96 }} transition={{ duration: 0.1 }} className="w-full sm:w-auto">
            <Button
              type="button"
              onClick={() => navigate("/learn")}
              className="w-full sm:w-auto bg-[#8b5cf6] hover:bg-[#8b5cf6]/90 dark:bg-[#9b5bdb] text-white font-semibold text-xs sm:text-sm gap-2 h-11 px-5 rounded-xl shadow-lg shadow-purple-950/50"
            >
              <span>{t("strategies_section.go_to_learn", "Vai alla sezione Learn")}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
}

