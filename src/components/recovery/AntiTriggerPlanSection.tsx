import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Plus, Trash2, Loader2, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { useDynamicTranslation } from "@/hooks/useDynamicTranslation";

interface AntiTriggerPlan {
  id: string;
  trigger: string;
  action: string;
  benefit: string;
  source_lang?: string;
}

/** Sentinel date for storing anti-trigger plans in journal_entries (date column). */
const ANTI_TRIGGER_ENTRY_DATE = "2000-01-02";

export function AntiTriggerPlanSection() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [plans, setPlans] = useState<AntiTriggerPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPlan, setNewPlan] = useState({ trigger: "", action: "", benefit: "" });

  const currentLang = (i18n.resolvedLanguage || i18n.language || "it").toLowerCase().split("-")[0];
  const rawPlanStrings = useMemo(
    () =>
      plans
        .flatMap((p) => [p.trigger, p.action, p.benefit])
        .filter((v): v is string => typeof v === "string" && v.trim().length > 0),
    [plans]
  );
  const { display } = useDynamicTranslation(rawPlanStrings, plans[0]?.source_lang);

  useEffect(() => {
    if (user) {
      loadPlans();
    }
  }, [user]);

  const loadPlans = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("user_id", user.id)
        .eq("entry_date", ANTI_TRIGGER_ENTRY_DATE)
        .maybeSingle();

      if (data?.content) {
        try {
          const parsed = JSON.parse(data.content);
          setPlans(parsed);
        } catch {
          setPlans([]);
        }
      }
    } catch (error) {
      console.error("Error loading plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const savePlans = async (updatedPlans: AntiTriggerPlan[]) => {
    if (!user) return;

    setSaving(true);
    try {
      const { data: existing } = await supabase
        .from("journal_entries")
        .select("id")
        .eq("user_id", user.id)
        .eq("entry_date", ANTI_TRIGGER_ENTRY_DATE)
        .maybeSingle();

      if (existing) {
        await supabase.from("journal_entries").update({ content: JSON.stringify(updatedPlans) }).eq("id", existing.id);
      } else {
        await supabase.from("journal_entries").insert({
          user_id: user.id,
          entry_date: ANTI_TRIGGER_ENTRY_DATE,
          content: JSON.stringify(updatedPlans),
        });
      }

      setPlans(updatedPlans);
    } catch (error) {
      toast({
        title: t("anti_trigger_plan.error_saving_title"),
        description: t("anti_trigger_plan.error_saving_desc"),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const addPlan = () => {
    if (!newPlan.trigger || !newPlan.action) {
      toast({
        title: t("anti_trigger_plan.incomplete_title"),
        description: t("anti_trigger_plan.incomplete_desc"),
        variant: "destructive",
      });
      return;
    }

    const plan: AntiTriggerPlan = {
      id: Date.now().toString(),
      source_lang: currentLang,
      trigger: newPlan.trigger.trim(),
      action: newPlan.action.trim(),
      benefit: newPlan.benefit.trim() || t("anti_trigger_plan.default_benefit", { defaultValue: "Proteggo la mia concentrazione" }),
    };

    const updatedPlans = [...plans, plan];
    savePlans(updatedPlans);
    setNewPlan({ trigger: "", action: "", benefit: "" });
    setIsModalOpen(false);
  };

  const removePlan = (id: string) => {
    const updatedPlans = plans.filter((p) => p.id !== id);
    savePlans(updatedPlans);
  };

  if (loading) {
    return (
      <Card className="border-border/60 bg-card/80 backdrop-blur-md">
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#4D87D9] dark:text-[#619BF0]" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-border/60 bg-card/80 backdrop-blur-md shadow-xl overflow-hidden">
        <CardHeader className="pb-3 pt-5 px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-bold text-foreground">
              <div className="p-1.5 rounded-lg bg-[#4D87D9]/10 text-[#4D87D9] dark:text-[#619BF0] border border-[#4D87D9]/20">
                <Shield className="h-4 w-4" />
              </div>
              <span>{t("anti_trigger_plan.title")}</span>
            </CardTitle>

            <motion.div whileTap={{ scale: 0.95 }} transition={{ duration: 0.1 }}>
              <Button
                size="sm"
                onClick={() => setIsModalOpen(true)}
                className="h-8 text-xs bg-[#4D87D9] hover:bg-[#3b75c7] text-white font-medium gap-1 px-3 rounded-xl shadow-md shadow-blue-950/40"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{t("anti_trigger_plan.new_recipe", "Nuova Ricetta")}</span>
              </Button>
            </motion.div>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {t("anti_trigger_plan.description")}
          </p>
        </CardHeader>

        <CardContent className="px-4 sm:px-6 pb-5 pt-1 space-y-3">
          {plans.length === 0 ? (
            <div className="p-6 text-center border border-dashed border-border/60 rounded-2xl bg-muted/30 dark:bg-slate-900/40">
              <Sparkles className="h-8 w-8 text-[#4D87D9] dark:text-[#619BF0] mx-auto mb-2" />
              <p className="text-xs sm:text-sm font-medium text-foreground">{t("anti_trigger_plan.no_recipes", "Nessuna ricetta anti-trigger creata")}</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                {t("anti_trigger_plan.no_recipes_desc", "Crea il tuo primo piano automatizzato \"SE (Trigger) ➔ ALLORA (Azione)\".")}
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsModalOpen(true)}
                className="mt-3 text-xs border-[#4D87D9]/40 text-[#4D87D9] dark:text-[#619BF0] hover:bg-[#4D87D9]/10 rounded-xl"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                {t("anti_trigger_plan.create_first_recipe", "Crea la prima ricetta")}
              </Button>
            </div>
          ) : (
            <AnimatePresence>
              <div className="space-y-2.5">
                {plans.map((plan) => (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="p-3.5 rounded-2xl bg-card dark:bg-slate-900/80 border border-border/60 hover:border-[#4D87D9]/30 transition-all shadow-sm group relative"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 text-xs text-[#4D87D9] dark:text-[#619BF0] font-semibold">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>{t("anti_trigger_plan.recipe_badge", "Ricetta Anti-Trigger")}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        onClick={() => removePlan(plan.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                      {/* Badge 1: SE */}
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-medium">
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-600 dark:text-amber-400 opacity-80">
                          {t("anti_trigger_plan.if_label", "SE:")}
                        </span>
                        <span>"{display(plan.trigger)}"</span>
                      </div>

                      {/* Arrow */}
                      <ArrowRight className="h-4 w-4 text-[#4D87D9] dark:text-[#619BF0] shrink-0" />

                      {/* Badge 2: ALLORA */}
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#4D87D9]/10 border border-[#4D87D9]/30 text-[#4D87D9] dark:text-[#619BF0] font-medium">
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#4D87D9] dark:text-[#619BF0] opacity-80">
                          {t("anti_trigger_plan.then_label", "ALLORA:")}
                        </span>
                        <span>"{display(plan.action)}"</span>
                      </div>
                    </div>

                    {plan.benefit && (
                      <p className="text-[11px] text-muted-foreground/80 mt-2 pl-1 italic">
                        {t("anti_trigger_plan.why_label", "Perché:")} {display(plan.benefit)}
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          )}
        </CardContent>
      </Card>

      {/* Modern Compact Modal / Bottom Sheet */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md bg-background dark:bg-slate-950 border-border/80 text-foreground rounded-2xl p-5 shadow-2xl">
          <DialogHeader className="pb-2">
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-[#4D87D9] dark:text-[#619BF0]">
              <Shield className="h-5 w-5 text-[#4D87D9] dark:text-[#619BF0]" />
              {t("anti_trigger_plan.modal_title", "Nuova Ricetta Anti-Trigger")}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {t("anti_trigger_plan.modal_subtitle", "Programma una risposta automatica istantanea quando si presenta uno specifico trigger.")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-amber-600 dark:text-amber-300 flex items-center gap-1">
                <span>{t("anti_trigger_plan.if_question", "SE (Qual è il trigger o situazione a rischio?)")}</span>
              </label>
              <Input
                placeholder={t("anti_trigger_plan.if_placeholder", "Es. Mi sento solo / annoiato a tarda notte...")}
                value={newPlan.trigger}
                onChange={(e) => setNewPlan((prev) => ({ ...prev, trigger: e.target.value }))}
                className="bg-muted/40 dark:bg-slate-900 border-border/60 focus:border-[#4D87D9] text-xs sm:text-sm h-10 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#4D87D9] dark:text-[#619BF0] flex items-center gap-1">
                <span>{t("anti_trigger_plan.then_question", "ALLORA (Quale azione esegui immediatamente?)")}</span>
              </label>
              <Input
                placeholder={t("anti_trigger_plan.then_placeholder", "Es. Faccio 15 piegamenti o metto il telefono in cucina...")}
                value={newPlan.action}
                onChange={(e) => setNewPlan((prev) => ({ ...prev, action: e.target.value }))}
                className="bg-muted/40 dark:bg-slate-900 border-border/60 focus:border-[#4D87D9] text-xs sm:text-sm h-10 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <span>{t("anti_trigger_plan.why_question", "PERCHÉ (Beneficio atteso - opzionale)")}</span>
              </label>
              <Input
                placeholder={t("anti_trigger_plan.why_placeholder", "Es. Rompe l'automatismo e rinfresca la mente...")}
                value={newPlan.benefit}
                onChange={(e) => setNewPlan((prev) => ({ ...prev, benefit: e.target.value }))}
                className="bg-slate-900 border-border/60 focus:border-[#4D87D9] text-xs sm:text-sm h-10 rounded-xl"
              />
            </div>
          </div>

          <DialogFooter className="pt-2 flex-row gap-2 justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsModalOpen(false)}
              className="text-xs text-muted-foreground rounded-xl"
            >
              {t("common.cancel", "Annulla")}
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={addPlan}
              disabled={saving}
              className="text-xs bg-[#4D87D9] hover:bg-[#3b75c7] text-white font-medium gap-1 rounded-xl px-4"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              {t("anti_trigger_plan.save_recipe", "Salva Ricetta")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

