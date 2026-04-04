import { useState, useEffect } from "react";
import { Shield, Plus, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface AntiTriggerPlan {
  id: string;
  trigger: string;
  action: string;
  benefit: string;
}

export function AntiTriggerPlanSection() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [plans, setPlans] = useState<AntiTriggerPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newPlan, setNewPlan] = useState({ trigger: "", action: "", benefit: "" });

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
        .eq("entry_date", "anti-trigger-plans")
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
        .eq("entry_date", "anti-trigger-plans")
        .maybeSingle();

      if (existing) {
        await supabase.from("journal_entries").update({ content: JSON.stringify(updatedPlans) }).eq("id", existing.id);
      } else {
        await supabase.from("journal_entries").insert({
          user_id: user.id,
          entry_date: "anti-trigger-plans",
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
    if (!newPlan.trigger || !newPlan.action || !newPlan.benefit) {
      toast({
        title: t("anti_trigger_plan.incomplete_title"),
        description: t("anti_trigger_plan.incomplete_desc"),
        variant: "destructive",
      });
      return;
    }

    const plan: AntiTriggerPlan = {
      id: Date.now().toString(),
      ...newPlan,
    };

    const updatedPlans = [...plans, plan];
    savePlans(updatedPlans);
    setNewPlan({ trigger: "", action: "", benefit: "" });
  };

  const removePlan = (id: string) => {
    const updatedPlans = plans.filter((p) => p.id !== id);
    savePlans(updatedPlans);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          {t("anti_trigger_plan.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-sm">{t("anti_trigger_plan.description")}</p>

        {plans.length > 0 && (
          <div className="space-y-2">
            {plans.map((plan) => (
              <div key={plan.id} className="p-3 rounded-lg bg-muted/30 border border-border/50 group">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm">
                    {t("anti_trigger_plan.template", {
                      trigger: plan.trigger,
                      action: plan.action,
                      benefit: plan.benefit,
                    })}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    onClick={() => removePlan(plan.id)}
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
          <p className="text-sm font-medium text-foreground">{t("anti_trigger_plan.add_new")}</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground shrink-0">{t("anti_trigger_plan.when")}</span>
              <Input
                placeholder={t("anti_trigger_plan.trigger_placeholder")}
                value={newPlan.trigger}
                onChange={(e) => setNewPlan((prev) => ({ ...prev, trigger: e.target.value }))}
                className="h-8 text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground shrink-0">{t("anti_trigger_plan.i_will")}</span>
              <Input
                placeholder={t("anti_trigger_plan.action_placeholder")}
                value={newPlan.action}
                onChange={(e) => setNewPlan((prev) => ({ ...prev, action: e.target.value }))}
                className="h-8 text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground shrink-0">{t("anti_trigger_plan.because_gives_me")}</span>
              <Input
                placeholder={t("anti_trigger_plan.benefit_placeholder")}
                value={newPlan.benefit}
                onChange={(e) => setNewPlan((prev) => ({ ...prev, benefit: e.target.value }))}
                className="h-8 text-sm"
              />
            </div>
          </div>
          <Button size="sm" onClick={addPlan} disabled={saving} className="w-full">
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            {t("anti_trigger_plan.add_button")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
