import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { CategoryPreferences } from "@/hooks/useCategoryPreferences";
import { 
  Leaf, 
  Rocket, 
  Sprout, 
  RefreshCw, 
  ShieldCheck, 
  Lock, 
  Check, 
  Crown, 
  ArrowRight, 
  Target,
  Flame,
  Moon,
  Calendar,
  Eye,
  ShieldAlert,
  Bot
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingModalProps {
  open: boolean;
  onComplete: (focus: string, preferences: CategoryPreferences) => Promise<void>;
  onSkip: () => Promise<void>;
}

const STEP1_OPTIONS = [
  {
    id: "productivity",
    icon: Rocket,
    titleKey: "onboarding.step1.options.productivity.title",
    descKey: "onboarding.step1.options.productivity.desc",
  },
  {
    id: "healthy_habits",
    icon: Sprout,
    titleKey: "onboarding.step1.options.healthy_habits.title",
    descKey: "onboarding.step1.options.healthy_habits.desc",
  },
  {
    id: "life_reset",
    icon: RefreshCw,
    titleKey: "onboarding.step1.options.life_reset.title",
    descKey: "onboarding.step1.options.life_reset.desc",
  },
  {
    id: "overcome_addiction",
    icon: ShieldCheck,
    titleKey: "onboarding.step1.options.overcome_addiction.title",
    descKey: "onboarding.step1.options.overcome_addiction.desc",
  },
  {
    id: "porn_recovery",
    icon: Lock,
    titleKey: "onboarding.step1.options.porn_recovery.title",
    descKey: "onboarding.step1.options.porn_recovery.desc",
  },
];

const TOOL_DEFS = [
  {
    key: "habits" as keyof CategoryPreferences,
    isPremium: false,
    icon: Target,
    titleKey: "onboarding.step2.tools.habits.title",
    descKey: "onboarding.step2.tools.habits.desc",
  },
  {
    key: "challenges" as keyof CategoryPreferences,
    isPremium: false,
    icon: Flame,
    titleKey: "onboarding.step2.tools.challenges.title",
    descKey: "onboarding.step2.tools.challenges.desc",
  },
  {
    key: "evening-reflection" as keyof CategoryPreferences,
    isPremium: false,
    icon: Moon,
    titleKey: "onboarding.step2.tools.reflection.title",
    descKey: "onboarding.step2.tools.reflection.desc",
  },
  {
    key: "daily-planning" as keyof CategoryPreferences,
    isPremium: false,
    icon: Calendar,
    titleKey: "onboarding.step2.tools.planning.title",
    descKey: "onboarding.step2.tools.planning.desc",
  },
  {
    key: "the-forge" as keyof CategoryPreferences,
    isPremium: true,
    icon: Eye,
    titleKey: "onboarding.step2.tools.the_forge.title",
    descKey: "onboarding.step2.tools.the_forge.desc",
  },
  {
    key: "trigger-tracking" as keyof CategoryPreferences,
    isPremium: true,
    icon: ShieldAlert,
    titleKey: "onboarding.step2.tools.trigger.title",
    descKey: "onboarding.step2.tools.trigger.desc",
  },
  {
    key: "coach" as keyof CategoryPreferences,
    isPremium: true,
    icon: Bot,
    titleKey: "onboarding.step2.tools.coach.title",
    descKey: "onboarding.step2.tools.coach.desc",
  },
];

export default function OnboardingModal({ open, onComplete, onSkip }: OnboardingModalProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedFocus, setSelectedFocus] = useState<string>("productivity");
  const [toolsState, setToolsState] = useState<CategoryPreferences>({
    habits: true,
    challenges: true,
    "evening-reflection": true,
    "daily-planning": true,
    "the-forge": false,
    "trigger-tracking": false,
    coach: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const hasSelectedPremium =
    toolsState["the-forge"] || toolsState["trigger-tracking"] || toolsState.coach;

  const toggleTool = (toolKey: keyof CategoryPreferences) => {
    setToolsState((prev) => ({
      ...prev,
      [toolKey]: !prev[toolKey],
    }));
  };

  const handleFinish = async () => {
    setSubmitting(true);
    try {
      await onComplete(selectedFocus, toolsState);
      toast({
        title: t("onboarding.welcome_toast_title", "Spazio di lavoro pronto!"),
        description: t(
          "onboarding.welcome_toast_desc",
          "Il tuo spazio di lavoro è pronto! Ricorda che puoi attivare o nascondere gli strumenti quando vuoi dalla pagina Strumenti."
        ),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = async () => {
    setSubmitting(true);
    try {
      await onSkip();
      toast({
        title: t("onboarding.welcome_toast_title", "Spazio di lavoro pronto!"),
        description: t(
          "onboarding.welcome_toast_desc",
          "Il tuo spazio di lavoro è pronto! Ricorda che puoi attivare o nascondere gli strumenti quando vuoi dalla pagina Strumenti."
        ),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-lg p-0 overflow-hidden bg-[#090d0b] border border-white/10 text-foreground shadow-2xl rounded-[28px] [&>button]:hidden">
        {/* Header Illustration & Navigation Area */}
        <div className="relative pt-7 pb-5 px-6 bg-gradient-to-b from-emerald-500/10 via-transparent to-transparent text-center border-b border-white/5">
          {/* Top Row: Step badge & Skip button */}
          <div className="flex items-center justify-between mb-4">
            <span className="bg-white/5 border border-white/10 text-muted-foreground text-[11px] font-medium px-3 py-1 rounded-full">
              {t("onboarding.step_count", { current: step, total: 2, defaultValue: `Step ${step} di 2` })}
            </span>

            <button
              onClick={handleSkip}
              disabled={submitting}
              className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1 rounded-full hover:bg-white/5"
            >
              {t("onboarding.skip", "Salta")}
            </button>
          </div>

          {/* Clean Circular Emblem Logo (Not Square) */}
          <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3 shadow-sm">
            <Leaf className="h-7 w-7 text-emerald-400" />
          </div>

          {/* Progress Bar */}
          <div className="w-full max-w-xs mx-auto h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-500 ease-out"
              style={{ width: step === 1 ? "50%" : "100%" }}
            />
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          {step === 1 ? (
            /* STEP 1: Focus Selection */
            <div className="space-y-6 animate-fade-in">
              <div className="text-center">
                <DialogTitle className="text-2xl font-extrabold tracking-tight mb-2 text-foreground">
                  {t("onboarding.step1.title", "Benvenuto in InnerBuild. Da dove vorresti iniziare il tuo percorso?")}
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                  {t("onboarding.step1.subtitle", "Scegli il tuo focus principale per aiutarci a creare uno spazio su misura per te.")}
                </DialogDescription>
              </div>

              {/* Options List */}
              <div className="space-y-2.5">
                {STEP1_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = selectedFocus === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => setSelectedFocus(opt.id)}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 cursor-pointer select-none",
                        isSelected
                          ? "bg-emerald-500/10 border-emerald-500/40 text-foreground shadow-sm"
                          : "bg-card/30 border-border/40 hover:bg-card/60 hover:border-border/70"
                      )}
                    >
                      <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                        <Icon className="h-5 w-5 text-emerald-400" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm sm:text-base font-semibold text-foreground leading-snug">
                          {t(opt.titleKey)}
                        </p>
                      </div>

                      {/* Clean Circular Radio Indicator */}
                      <div
                        className={cn(
                          "w-5.5 h-5.5 rounded-full border flex items-center justify-center shrink-0 transition-colors",
                          isSelected
                            ? "border-emerald-500 bg-emerald-500 text-slate-950"
                            : "border-border/60 bg-transparent"
                        )}
                      >
                        {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              <Button
                onClick={() => setStep(2)}
                className="w-full h-12 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-base hover:from-emerald-400 hover:to-teal-400 active:scale-[0.98] transition-all shadow-md"
              >
                <span>{t("onboarding.step2.continue", "Continua")}</span>
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </div>
          ) : (
            /* STEP 2: Workspace Tools Customization */
            <div className="space-y-6 animate-fade-in">
              <div className="text-center">
                <DialogTitle className="text-2xl font-extrabold tracking-tight mb-2 text-foreground">
                  {t("onboarding.step2.title", "Quali strumenti vuoi avere a portata di mano?")}
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                  {t("onboarding.step2.subtitle", "Scegli cosa attivare adesso. Potrai sempre aggiungere o rimuovere ogni modulo nella pagina Strumenti in qualsiasi momento.")}
                </DialogDescription>
              </div>

              {/* Tools List */}
              <div className="space-y-2.5">
                {TOOL_DEFS.map((tool) => {
                  const Icon = tool.icon;
                  const isChecked = toolsState[tool.key];
                  return (
                    <div
                      key={tool.key}
                      onClick={() => toggleTool(tool.key)}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 cursor-pointer select-none",
                        isChecked
                          ? "bg-emerald-500/10 border-emerald-500/40 text-foreground shadow-sm"
                          : "bg-card/30 border-border/40 hover:bg-card/60 hover:border-border/70"
                      )}
                    >
                      <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                        <Icon className="h-5 w-5 text-emerald-400" />
                      </div>

                      <div className="flex-1 min-w-0 flex items-center gap-2">
                        <span className="text-sm sm:text-base font-semibold text-foreground leading-snug">
                          {t(tool.titleKey)}
                        </span>
                        {tool.isPremium && (
                          <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5">
                            <Crown className="h-3 w-3 mr-0.5" />
                            PRO
                          </Badge>
                        )}
                      </div>

                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => toggleTool(tool.key)}
                        className="h-5 w-5 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Non-blocking Premium Banner */}
              {hasSelectedPremium && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-start gap-2 animate-slide-up">
                  <Crown className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed text-[11px]">
                    {t(
                      "onboarding.step2.premium_notice",
                      "Hai selezionato funzionalità Premium. Puoi provare il piano Premium o continuare con i soli moduli gratuiti attivi."
                    )}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-1.5 pt-1">
                <Button
                  onClick={handleFinish}
                  disabled={submitting}
                  className="w-full h-11 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-sm hover:from-emerald-400 hover:to-teal-400 active:scale-[0.98] transition-all"
                >
                  {t("onboarding.step2.activate_workspace", "Attiva Workspace")}
                </Button>

                {hasSelectedPremium && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      handleFinish();
                      navigate("/#pricing");
                    }}
                    className="w-full h-9 rounded-xl text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                  >
                    <Crown className="h-3.5 w-3.5 mr-1.5" />
                    {t("onboarding.step2.explore_premium", "Scopri il piano Premium")}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
