import { useState, useMemo } from "react";
import { Zap, Droplets, Footprints, Dumbbell, Phone, Users, Check, type LucideIcon } from "lucide-react";
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

const ACTION_COLORS: Record<ActionId, { color: string; bgColor: string }> = {
  cold_shower: { color: "text-cyan-500", bgColor: "bg-cyan-500/10" },
  walk: { color: "text-emerald-500", bgColor: "bg-emerald-500/10" },
  exercise: { color: "text-amber-500", bgColor: "bg-amber-500/10" },
  contact: { color: "text-blue-500", bgColor: "bg-blue-500/10" },
  people: { color: "text-purple-500", bgColor: "bg-purple-500/10" },
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

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            {t("craving_actions.title")}
          </CardTitle>
          {completedActions.length > 0 && (
            <Button variant="ghost" size="sm" onClick={resetActions} className="text-xs">
              {t("craving_actions.reset")}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm mb-4">{t("craving_actions.description")}</p>

        <div className="space-y-2">
          {actions.map((action) => {
            const isCompleted = completedActions.includes(action.id);
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                type="button"
                onClick={() => toggleAction(action.id)}
                className={`w-full flex items-start gap-3 p-3 rounded-lg transition-all text-left ${
                  isCompleted
                    ? "bg-primary/20 border border-primary/30"
                    : "bg-background/50 hover:bg-background/80 border border-transparent"
                }`}
              >
                <div className={`p-2 rounded-lg ${isCompleted ? "bg-primary/30" : action.bgColor} shrink-0`}>
                  {isCompleted ? (
                    <Check className="h-4 w-4 text-primary" />
                  ) : (
                    <Icon className={`h-4 w-4 ${action.color}`} />
                  )}
                </div>
                <div className="flex-1">
                  <p
                    className={`font-medium text-sm ${
                      isCompleted ? "text-primary line-through" : "text-foreground"
                    }`}
                  >
                    {action.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground/70 mt-4 text-center italic">
          {t("craving_actions.footer_hint")}
        </p>
      </CardContent>
    </Card>
  );
}
