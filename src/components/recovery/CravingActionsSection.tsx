import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Droplets, Footprints, Dumbbell, Phone, Users, Check, RotateCcw, Sparkles, type LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

const ACTION_IDS = ["cold_shower", "walk", "exercise", "contact", "people"] as const;

type ActionId = (typeof ACTION_IDS)[number];

const ACTION_ICONS: Record<ActionId, LucideIcon> = {
  cold_shower: Droplets,
  walk: Footprints,
  exercise: Dumbbell,
  contact: Phone,
  people: Users,
};

const ACTION_COLORS: Record<ActionId, { color: string; bgColor: string; activeGlow: string }> = {
  cold_shower: { color: "text-cyan-400", bgColor: "bg-cyan-500/10", activeGlow: "border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.2)]" },
  walk: { color: "text-emerald-400", bgColor: "bg-emerald-500/10", activeGlow: "border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.2)]" },
  exercise: { color: "text-amber-400", bgColor: "bg-amber-500/10", activeGlow: "border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.2)]" },
  contact: { color: "text-blue-400", bgColor: "bg-blue-500/10", activeGlow: "border-blue-500/50 shadow-[0_0_12px_rgba(59,130,246,0.2)]" },
  people: { color: "text-purple-400", bgColor: "bg-purple-500/10", activeGlow: "border-purple-500/50 shadow-[0_0_12px_rgba(168,85,247,0.2)]" },
};

export function CravingActionsSection() {
  const { t } = useTranslation();
  const [completedActions, setCompletedActions] = useState<string[]>([]);

  const actions = useMemo(
    () =>
      ACTION_IDS.map((id) => ({
        id,
        icon: ACTION_ICONS[id],
        title: t(`craving_actions.${id}_title`),
        description: t(`craving_actions.${id}_desc`),
        ...ACTION_COLORS[id],
      })),
    [t]
  );

  const toggleAction = (actionId: string) => {
    setCompletedActions((prev) =>
      prev.includes(actionId) ? prev.filter((x) => x !== actionId) : [...prev, actionId]
    );
  };

  const resetActions = () => {
    setCompletedActions([]);
  };

  const progressPercent = Math.round((completedActions.length / ACTION_IDS.length) * 100);

  return (
    <Card className="border-border/60 bg-card/80 backdrop-blur-md shadow-xl overflow-hidden">
      <CardHeader className="pb-3 pt-5 px-4 sm:px-6">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-bold text-foreground">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Zap className="h-4 w-4" />
            </div>
            <span>{t("craving_actions.title")}</span>
          </CardTitle>
          {completedActions.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetActions}
              className="h-8 text-xs text-muted-foreground hover:text-emerald-400 gap-1 px-2.5 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>{t("craving_actions.reset")}</span>
            </Button>
          )}
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          {t("craving_actions.description")}
        </p>

        {/* Progress tracker pill */}
        <div className="mt-3 flex items-center justify-between bg-muted/40 p-2 rounded-xl border border-border/40 text-xs">
          <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            {t("craving_actions.anti_impulse_action", "Azione anti-impulso:")}
          </span>
          <span className="font-semibold text-emerald-400">
            {t("craving_actions.completed_count", { completed: completedActions.length, total: ACTION_IDS.length, percent: progressPercent, defaultValue: `${completedActions.length}/${ACTION_IDS.length} completate (${progressPercent}%)` })}
          </span>
        </div>
      </CardHeader>

      <CardContent className="px-4 sm:px-6 pb-5 pt-1">
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          {actions.map((action) => {
            const isCompleted = completedActions.includes(action.id);
            const Icon = action.icon;

            return (
              <motion.button
                key={action.id}
                type="button"
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                onClick={() => toggleAction(action.id)}
                className={`relative flex flex-col justify-between p-3.5 rounded-2xl text-left transition-all duration-150 border ${
                  isCompleted
                    ? "bg-emerald-500/10 border-emerald-500/60 shadow-[0_0_16px_rgba(16,185,129,0.25)]"
                    : "bg-card hover:bg-muted/80 dark:bg-slate-900/60 dark:hover:bg-slate-800/80 border-border/50 hover:border-emerald-500/30"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div className={`p-2 rounded-xl ${isCompleted ? "bg-emerald-500/20 text-emerald-400" : `${action.bgColor} ${action.color}`} transition-colors`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <AnimatePresence mode="wait">
                    {isCompleted ? (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="h-5 w-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-md"
                      >
                        <Check className="h-3 w-3 stroke-[3]" />
                      </motion.div>
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-border/60" />
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <h4 className={`text-xs sm:text-sm font-semibold leading-snug ${isCompleted ? "text-emerald-400" : "text-foreground"}`}>
                    {action.title}
                  </h4>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5 leading-tight">
                    {action.description}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>

        <p className="text-[11px] text-muted-foreground/70 mt-3 text-center italic">
          {t("craving_actions.footer_hint")}
        </p>
      </CardContent>
    </Card>
  );
}

