import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Heart, Shield, Sparkles, X, Loader2, ArrowRight, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useRecoveryJourney } from "@/hooks/useRecoveryJourney";
import { useUiBatchTranslation } from "@/hooks/useUiBatchTranslation";
import { RecoveryImpactSimulation } from "./RecoveryImpactSimulation";

type Step = "feeling" | "location" | "alone" | "loading" | "guidance";

const feelingKeys = [
  "stressed", "bored", "lonely", "anxious", "sad",
  "frustrated", "tired", "restless", "overwhelmed",
] as const;

const locationKeys = [
  "home_bedroom", "home_living", "work", "school", "public", "bathroom", "other",
] as const;

interface EmergencyGuidance {
  immediate_actions: string[];
  personal_reminder: string;
  calming_message: string;
}

interface AntiTriggerPlan {
  id: string;
  trigger: string;
  action: string;
  benefit: string;
  source_lang?: string;
}

interface EmergencyUrgeModalProps {
  open: boolean;
  onClose: () => void;
  hasCheckedInToday?: boolean;
  onDeclareRelapse?: () => void;
  journey?: {
    id: string;
    current_streak: number;
    jokers_remaining: number;
    status: string;
  } | null;
}

const QUIT_REASONS_ENTRY_DATE = "2000-01-01";
const ANTI_TRIGGER_ENTRY_DATE = "2000-01-02";

export function EmergencyUrgeModal({
  open,
  onClose,
  hasCheckedInToday = false,
  onDeclareRelapse,
  journey: initialJourney,
}: EmergencyUrgeModalProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { journey: fetchedJourney } = useRecoveryJourney();
  const journey = initialJourney || fetchedJourney;
  const [step, setStep] = useState<Step>("feeling");
  const [feelingKey, setFeelingKey] = useState<string>("");
  const [manualFeeling, setManualFeeling] = useState<string>("");
  const [locationKey, setLocationKey] = useState<string>("");
  const [manualLocation, setManualLocation] = useState<string>("");
  const [alone, setAlone] = useState<boolean | null>(null);
  const [guidance, setGuidance] = useState<EmergencyGuidance | null>(null);
  const [personalExpanded, setPersonalExpanded] = useState(false);
  const [personalLoading, setPersonalLoading] = useState(false);
  const [personalReasons, setPersonalReasons] = useState<string[]>([]);
  const [personalPlans, setPersonalPlans] = useState<AntiTriggerPlan[]>([]);

  const reset = () => {
    setStep("feeling");
    setFeelingKey("");
    setManualFeeling("");
    setLocationKey("");
    setManualLocation("");
    setAlone(null);
    setGuidance(null);
    setPersonalExpanded(false);
    setPersonalReasons([]);
    setPersonalPlans([]);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const fetchGuidance = async () => {
    setStep("loading");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const manual = manualFeeling.trim();
      const feelingLabel = manual
        ? manual
        : feelingKey
          ? t(`emergency_urge.feelings.${feelingKey}`)
          : "";
      const locationLabel = manualLocation.trim()
        ? manualLocation.trim()
        : locationKey
          ? t(`emergency_urge.locations.${locationKey}`)
          : "";

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/emergency-urge`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            feeling: feelingLabel,
            location: locationLabel,
            alone,
            language: (i18n.resolvedLanguage || i18n.language || "en").split("-")[0],
          }),
        }
      );

      if (!resp.ok) throw new Error("Failed to get guidance");
      const data: EmergencyGuidance = await resp.json();
      setGuidance(data);
      setStep("guidance");
    } catch (e) {
      console.error("Emergency guidance error:", e);
      setGuidance({
        immediate_actions: [
          t("emergency_urge.fallback_action_1"),
          t("emergency_urge.fallback_action_2"),
          t("emergency_urge.fallback_action_3"),
        ],
        personal_reminder: t("emergency_urge.personal_reminder"),
        calming_message: t("emergency_urge.calming_message"),
      });
      setStep("guidance");
    }
  };

  const currentLangBase = useMemo(() => (i18n.resolvedLanguage || i18n.language || "it").toLowerCase().split("-")[0], [i18n.resolvedLanguage, i18n.language]);
  const shouldTranslateReasons = currentLangBase !== "it";

  const rawReasonStrings = useMemo(
    () => personalReasons.map((r) => String(r)).filter((v) => v.trim().length > 0),
    [personalReasons]
  );
  const { display: displayReasons } = useUiBatchTranslation(rawReasonStrings, shouldTranslateReasons && rawReasonStrings.length > 0);

  const rawPlanStrings = useMemo(
    () => personalPlans.flatMap((p) => [p.trigger, p.action, p.benefit]).filter((v): v is string => typeof v === "string" && v.trim().length > 0),
    [personalPlans]
  );
  const { display: displayPlans } = useUiBatchTranslation(rawPlanStrings, rawPlanStrings.length > 0);

  const fetchPersonalData = async () => {
    if (!user) return;
    setPersonalLoading(true);
    try {
      const [reasonsRes, plansRes] = await Promise.all([
        supabase
          .from("journal_entries")
          .select("content")
          .eq("user_id", user.id)
          .eq("entry_date", QUIT_REASONS_ENTRY_DATE)
          .maybeSingle(),
        supabase
          .from("journal_entries")
          .select("content")
          .eq("user_id", user.id)
          .eq("entry_date", ANTI_TRIGGER_ENTRY_DATE)
          .maybeSingle(),
      ]);

      const reasonsContent = reasonsRes.data?.content ?? null;
      const plansContent = plansRes.data?.content ?? null;

      let parsedReasons: string[] = [];
      if (typeof reasonsContent === "string" && reasonsContent.trim()) {
        try {
          parsedReasons = JSON.parse(reasonsContent);
        } catch {
          parsedReasons = [];
        }
      }

      let parsedPlans: AntiTriggerPlan[] = [];
      if (typeof plansContent === "string" && plansContent.trim()) {
        try {
          parsedPlans = JSON.parse(plansContent);
        } catch {
          parsedPlans = [];
        }
      }

      setPersonalReasons(Array.isArray(parsedReasons) ? parsedReasons : []);
      setPersonalPlans(Array.isArray(parsedPlans) ? parsedPlans : []);
    } catch (e) {
      console.error("Error loading personal motivations/plans:", e);
    } finally {
      setPersonalLoading(false);
    }
  };

  useEffect(() => {
    if (open && step === "guidance" && user) {
      void fetchPersonalData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, step, user]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div
        className="relative w-full max-w-md max-h-[85vh] overflow-y-auto bg-background rounded-2xl border border-border/50 shadow-2xl animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 safe-area-header bg-background/95 backdrop-blur-sm border-b border-border/50">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-rose-500/15 flex items-center justify-center">
                <Shield className="w-4 h-4 text-rose-500" />
              </div>
              <span className="font-semibold text-foreground">{t("emergency_urge.header")}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {step === "feeling" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <h3 className="text-lg font-semibold text-foreground">{t("emergency_urge.feeling_title")}</h3>
                <p className="text-sm text-muted-foreground mt-1">{t("emergency_urge.feeling_subtitle")}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {feelingKeys.map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFeelingKey(key);
                      setManualFeeling("");
                      setStep("location");
                    }}
                    className="px-4 py-2 rounded-full text-sm font-medium bg-muted/60 text-foreground hover:bg-muted transition-all"
                  >
                    {t(`emergency_urge.feelings.${key}`)}
                  </button>
                ))}
              </div>

<div className="space-y-2 relative">
                <Textarea
                  value={manualFeeling}
                  onChange={(e) => setManualFeeling(e.target.value)}
                  placeholder={t("emergency_urge.feeling_subtitle")}
                  className="min-h-[90px] resize-none pr-12"
                />
                {manualFeeling.trim().length > 0 && (
                  <Button
                    size="icon"
                    className="absolute bottom-10 right-2 w-8 h-8 rounded-full shadow-lg animate-in fade-in zoom-in duration-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      setStep("location");
                    }}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                )}
                <p className="text-xs text-muted-foreground">
                  {t("emergency_urge.manual_feeling_hint")}
                </p>
              </div>
            </div>
          )}

          {step === "location" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <h3 className="text-lg font-semibold text-foreground">{t("emergency_urge.location_title")}</h3>
                <p className="text-sm text-muted-foreground mt-1">{t("emergency_urge.location_subtitle")}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {locationKeys.map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLocationKey(key);
                      setManualLocation("");
                      setStep("alone");
                    }}
                    className="px-4 py-2 rounded-full text-sm font-medium bg-muted/60 text-foreground hover:bg-muted transition-all"
                  >
                    {t(`emergency_urge.locations.${key}`)}
                  </button>
                ))}
              </div>

              <div className="space-y-2 relative">
                <Textarea
                  value={manualLocation}
                  onChange={(e) => setManualLocation(e.target.value)}
                  placeholder={t("emergency_urge.location_subtitle")}
                  className="min-h-[90px] resize-none pr-12"
                />
                {manualLocation.trim().length > 0 && (
                  <Button
                    size="icon"
                    className="absolute bottom-1 right-2 w-8 h-8 rounded-full shadow-lg animate-in fade-in zoom-in duration-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      setStep("alone");
                    }}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          )}

          {step === "alone" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <h3 className="text-lg font-semibold text-foreground">{t("emergency_urge.alone_title")}</h3>
                <p className="text-sm text-muted-foreground mt-1">{t("emergency_urge.alone_subtitle")}</p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 h-14 text-base"
                  onClick={(e) => {
                    e.stopPropagation();
                    setAlone(true);
                    fetchGuidance();
                  }}
                >
                  {t("emergency_urge.yes_alone")}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 h-14 text-base"
                  onClick={(e) => {
                    e.stopPropagation();
                    setAlone(false);
                    fetchGuidance();
                  }}
                >
                  {t("emergency_urge.no_with_others")}
                </Button>
              </div>
            </div>
          )}

          {step === "loading" && (
            <div className="flex flex-col items-center justify-center py-12 gap-4 animate-in fade-in duration-200">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <div className="text-center">
                <p className="font-medium text-foreground">{t("emergency_urge.loading_title")}</p>
                <p className="text-sm text-muted-foreground mt-1">{t("emergency_urge.loading_subtitle")}</p>
              </div>
            </div>
          )}

          {step === "guidance" && guidance && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <Heart className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm text-foreground leading-relaxed">{guidance.calming_message}</p>
                  </div>
                </CardContent>
              </Card>

              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  {t("emergency_urge.actions_title")}
                </h4>
                <div className="space-y-2">
                  {guidance.immediate_actions.map((action, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 rounded-xl bg-muted/40 border border-border/50"
                    >
                      <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-primary">{i + 1}</span>
                      </div>
                      <p className="text-sm text-foreground">{action}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Card className="border-amber-500/20 bg-amber-500/5">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">
                        {t("emergency_urge.remember_why")}
                      </p>
                      <p className="text-sm text-foreground leading-relaxed">{guidance.personal_reminder}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="border border-border/50 rounded-xl bg-muted/30 overflow-hidden">
                <button
                  type="button"
                  className="w-full px-4 py-3 flex items-center justify-between text-left"
                  onClick={() => setPersonalExpanded((v) => !v)}
                >
                  <span className="text-sm font-semibold text-foreground">{t("reasons_section.title")}</span>
                  <span className="text-xs text-muted-foreground">{t("common.details")}</span>
                </button>
                {personalExpanded && (
                  <div className="px-4 pb-4">
                    {personalLoading ? (
                      <div className="flex items-center gap-2 text-muted-foreground py-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>{t("common.loading")}</span>
                      </div>
                    ) : (
                      <div className="space-y-3 pt-1">
                        {personalReasons.length > 0 && (
                          <div className="space-y-2">
                            <div className="space-y-2">
                              {personalReasons.map((r, idx) => (
                                <div key={`${idx}-${r}`} className="text-sm text-foreground">
                                  • {shouldTranslateReasons ? displayReasons(r) : r}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {personalPlans.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/80 pt-2 border-t border-border/30">{t("anti_trigger_plan.title")}</h4>
                            <div className="space-y-2">
                              {personalPlans.map((plan) => {
                                const source = plan.source_lang || currentLangBase;
                                const shouldTranslatePlan = source !== currentLangBase;
                                const trigger = shouldTranslatePlan ? displayPlans(plan.trigger) : plan.trigger;
                                const action = shouldTranslatePlan ? displayPlans(plan.action) : plan.action;
                                const benefit = shouldTranslatePlan ? displayPlans(plan.benefit) : plan.benefit;
                                return (
                                  <div key={plan.id} className="text-sm text-foreground">
                                    {t("anti_trigger_plan.template", { trigger, action, benefit })}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Recommendations for missing data */}
                        {(personalReasons.length === 0 || personalPlans.length === 0) && (
                          <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/10 space-y-2">
                            <div className="flex items-center gap-2 text-primary">
                              <Lightbulb className="w-4 h-4" />
                              <span className="text-xs font-bold uppercase tracking-wider">
                                {t("common.pro_tip") || "Suggerimento"}
                              </span>
                            </div>
                            <p className="text-xs text-foreground/80 leading-relaxed">
                              {personalReasons.length === 0 && personalPlans.length === 0
                                ? t("emergency_urge.no_data_hint_both")
                                : personalReasons.length === 0
                                  ? t("emergency_urge.no_data_hint_reasons")
                                  : t("emergency_urge.no_data_hint_plans")}
                            </p>
                            <Button 
                              variant="link" 
                              className="h-auto p-0 text-xs font-semibold"
                              onClick={() => {
                                handleClose();
                                navigate("/the-forge");
                              }}
                            >
                              {t("emergency_urge.configure_now")}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {journey ? (
                <RecoveryImpactSimulation
                  journeyId={journey.id}
                  currentStreak={journey.current_streak}
                  jokersRemaining={journey.jokers_remaining}
                  status={journey.status}
                  hasCheckedInToday={hasCheckedInToday}
                  onExit={handleClose}
                  onDeclareRelapse={() => {
                    onDeclareRelapse?.();
                    handleClose();
                  }}
                />
              ) : (
                <Button
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClose();
                  }}
                >
                  {t("emergency_urge.close_button")}
                </Button>
              )}
              <p className="text-xs text-center text-muted-foreground">{t("emergency_urge.footer_note")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
