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
  remove_access: { color: "text-rose-400", bgColor: "bg-rose-500/10" },
  change_env: { color: "text-blue-400", bgColor: "bg-blue-500/10" },
  track_streak: { color: "text-amber-400", bgColor: "bg-amber-500/10" },
  exercise: { color: "text-emerald-400", bgColor: "bg-emerald-500/10" },
  meditation: { color: "text-purple-400", bgColor: "bg-purple-500/10" },
  cold_showers: { color: "text-cyan-400", bgColor: "bg-cyan-500/10" },
  journaling: { color: "text-pink-400", bgColor: "bg-pink-500/10" },
  social: { color: "text-indigo-400", bgColor: "bg-indigo-500/10" },
  nature: { color: "text-green-400", bgColor: "bg-green-500/10" },
  hobbies: { color: "text-orange-400", bgColor: "bg-orange-500/10" },
  prioritize_sleep: { color: "text-slate-300", bgColor: "bg-slate-500/10" },
  self_compassion: { color: "text-rose-300", bgColor: "bg-rose-400/10" },
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
              <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Lightbulb className="h-4 w-4" />
              </div>
              <span>Strategie di Recupero</span>
            </CardTitle>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Seleziona una categoria per visualizzare micro-azioni pratiche e mirate.
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
                      ? "bg-purple-600 text-white shadow-md shadow-purple-950/40 border border-purple-400/40"
                      : "bg-slate-900/80 text-muted-foreground hover:text-foreground border border-border/50"
                  }`}
                >
                  <CatIcon className="h-3.5 w-3.5" />
                  <span>{cat.label}</span>
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
                    className="flex items-start gap-3 p-3 rounded-2xl bg-slate-900/60 border border-border/50 hover:border-purple-500/30 transition-colors"
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
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, delay: 0.15 }}
    >
      <Card className="relative border-purple-500/40 bg-gradient-to-br from-purple-950/60 via-slate-900/90 to-emerald-950/40 backdrop-blur-xl shadow-2xl overflow-hidden p-5 sm:p-6 text-foreground rounded-2xl">
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1 max-w-lg">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 mb-1">
              <BookOpen className="h-3 w-3" />
              Guida Completa
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              Vuoi approfondire la scienza del recupero?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              Leggi le guide complete, gli studi neuroscientifici e gli articoli dedicati.
            </p>
          </div>

          <motion.div whileTap={{ scale: 0.96 }} transition={{ duration: 0.1 }} className="w-full sm:w-auto">
            <Button
              type="button"
              onClick={() => navigate("/learn")}
              className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-500 hover:to-emerald-500 text-white font-semibold text-xs sm:text-sm gap-2 h-11 px-5 rounded-xl shadow-lg shadow-purple-950/50"
            >
              <span>Vai alla sezione Learn</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
}

