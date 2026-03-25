import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  X,
  ChevronLeft,
  ChevronRight,
  CloudRain,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  Loader2,
  Check,
} from "lucide-react";
import { DebriefFormData } from "@/hooks/useFailureDebrief";
import { useTranslation } from "react-i18next";

interface TodayContext {
  recentTriggers: Array<{
    emotion: string;
    situation: string;
    time_context: string;
    impulse_intensity: number;
  }>;
  todayCheckin: {
    mood: string;
    energy_level: number;
  } | null;
  hasReflection: boolean;
  hasJournal: boolean;
}

interface FailureDebriefWizardProps {
  debriefId: string;
  todayContext: TodayContext | null;
  onComplete: () => void;
  onClose: () => void;
  updateDebrief: (
    id: string,
    data: DebriefFormData & { is_completed?: boolean; ai_suggestions?: string[] }
  ) => Promise<boolean>;
  getAISuggestions: (data: DebriefFormData) => Promise<string[]>;
  saving: boolean;
}

const MOOD_KEYS = [
  { value: "stressed", emoji: "😰" },
  { value: "anxious", emoji: "😟" },
  { value: "bored", emoji: "😐" },
  { value: "lonely", emoji: "😢" },
  { value: "tired", emoji: "😴" },
  { value: "angry", emoji: "😠" },
  { value: "sad", emoji: "😔" },
  { value: "overwhelmed", emoji: "😵" },
];

const TIME_KEYS = [
  "early_morning",
  "morning",
  "afternoon",
  "evening",
  "night",
  "late_night",
];

const SIGNAL_KEYS = [
  "skipped_reflection",
  "skipped_journal",
  "poor_sleep",
  "skipped_exercise",
  "isolation",
  "screen_time",
  "stress_buildup",
  "trigger_ignored",
  "other",
];

export function FailureDebriefWizard({
  debriefId,
  todayContext,
  onComplete,
  onClose,
  updateDebrief,
  getAISuggestions,
  saving,
}: FailureDebriefWizardProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  const [formData, setFormData] = useState<DebriefFormData>({
    context: "",
    mood: "",
    trigger: "",
    time_of_day: "",
    location: "",
    was_alone: true,
    ignored_signal: "",
    signal_details: "",
    action_plan: "",
  });

  // Pre-fill from today's context
  useEffect(() => {
    if (todayContext) {
      const recentTrigger = todayContext.recentTriggers[0];
      if (recentTrigger) {
        setFormData((prev) => ({
          ...prev,
          mood: prev.mood || recentTrigger.emotion,
          trigger: prev.trigger || recentTrigger.situation,
          time_of_day: prev.time_of_day || recentTrigger.time_context,
        }));
      }
      if (todayContext.todayCheckin) {
        setFormData((prev) => ({
          ...prev,
          mood: prev.mood || todayContext.todayCheckin!.mood,
        }));
      }
      
      if (!todayContext.hasReflection) {
        setFormData((prev) => ({
          ...prev,
          ignored_signal: prev.ignored_signal || "skipped_reflection",
        }));
      } else if (!todayContext.hasJournal) {
        setFormData((prev) => ({
          ...prev,
          ignored_signal: prev.ignored_signal || "skipped_journal",
        }));
      }
    }
  }, [todayContext]);

  const handleNext = async () => {
    await updateDebrief(debriefId, formData);

    if (step === 2) {
      setLoadingSuggestions(true);
      const suggestions = await getAISuggestions(formData);
      setAiSuggestions(suggestions);
      setLoadingSuggestions(false);
    }

    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    const success = await updateDebrief(debriefId, {
      ...formData,
      is_completed: true,
      ai_suggestions: aiSuggestions,
    } as DebriefFormData & { is_completed: boolean; ai_suggestions: string[] });
    
    if (success) {
      onComplete();
    }
  };

  const progress = (step / 3) * 100;

  const stepIcons = [
    <CloudRain key="1" className="w-5 h-5" />,
    <AlertTriangle key="2" className="w-5 h-5" />,
    <Lightbulb key="3" className="w-5 h-5" />,
  ];

  const stepTitles = [
    t("failure_debrief.step1_title"),
    t("failure_debrief.step2_title"),
    t("failure_debrief.step3_title"),
  ];

  const stepDescriptions = [
    t("failure_debrief.step1_desc"),
    t("failure_debrief.step2_desc"),
    t("failure_debrief.step3_desc"),
  ];

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-lg max-h-[90vh] overflow-y-auto p-0 gap-0">
        <DialogHeader className="p-4 pb-2 border-b border-border/50 sticky top-0 bg-background z-10">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                {stepIcons[step - 1]}
              </div>
              {t("failure_debrief.step_label", { step })}: {stepTitles[step - 1]}
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {stepDescriptions[step - 1]}
          </p>
          <div className="flex items-center gap-2 mt-3">
            <Progress value={progress} className="h-2" />
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {step}/3
            </span>
          </div>
        </DialogHeader>

        <div className="p-4 space-y-4">
          {/* Step 1: What Happened */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t("failure_debrief.feeling_label")}</Label>
                <div className="grid grid-cols-4 gap-2">
                  {MOOD_KEYS.map((mood) => (
                    <button
                      key={mood.value}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, mood: mood.value }))}
                      className={`p-2 rounded-lg border text-center transition-all ${
                        formData.mood === mood.value
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <span className="text-xl block">{mood.emoji}</span>
                      <span className="text-xs text-muted-foreground">{t(`failure_debrief.moods.${mood.value}`)}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t("failure_debrief.when_label")}</Label>
                <Select
                  value={formData.time_of_day}
                  onValueChange={(v) => setFormData((prev) => ({ ...prev, time_of_day: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("failure_debrief.time_placeholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_KEYS.map((key) => (
                      <SelectItem key={key} value={key}>
                        {t(`failure_debrief.times.${key}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t("failure_debrief.context_label")}</Label>
                <Textarea
                  placeholder={t("failure_debrief.context_placeholder")}
                  value={formData.context}
                  onChange={(e) => setFormData((prev) => ({ ...prev, context: e.target.value }))}
                  className="min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label>{t("failure_debrief.trigger_label")}</Label>
                <Textarea
                  placeholder={t("failure_debrief.trigger_placeholder")}
                  value={formData.trigger}
                  onChange={(e) => setFormData((prev) => ({ ...prev, trigger: e.target.value }))}
                  className="min-h-[60px]"
                />
              </div>
            </div>
          )}

          {/* Step 2: First Signal Ignored */}
          {step === 2 && (
            <div className="space-y-4">
              <Card className="border-amber-500/30 bg-amber-500/5">
                <CardContent className="p-3">
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    💡 {t("failure_debrief.signal_hint")}
                  </p>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <Label>{t("failure_debrief.signal_label")}</Label>
                <div className="grid gap-2">
                  {SIGNAL_KEYS.map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, ignored_signal: key }))
                      }
                      className={`p-3 rounded-lg border text-left transition-all ${
                        formData.ignored_signal === key
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <span className="text-sm">{t(`failure_debrief.signals.${key}`)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {formData.ignored_signal === "other" && (
                <div className="space-y-2">
                  <Label>{t("failure_debrief.tell_more_label")}</Label>
                  <Textarea
                    placeholder={t("failure_debrief.tell_more_placeholder")}
                    value={formData.signal_details}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, signal_details: e.target.value }))
                    }
                    className="min-h-[80px]"
                  />
                </div>
              )}

              {/* Show detected signals */}
              {todayContext && (
                <Card className="border-border/50 bg-muted/30">
                  <CardHeader className="p-3 pb-1">
                    <CardTitle className="text-xs text-muted-foreground uppercase tracking-wide">
                      {t("failure_debrief.data_noticed_title")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 space-y-1">
                    {!todayContext.hasReflection && (
                      <p className="text-sm flex items-center gap-2">
                        <span className="text-amber-500">⚠️</span>
                        {t("failure_debrief.no_reflection")}
                      </p>
                    )}
                    {!todayContext.hasJournal && (
                      <p className="text-sm flex items-center gap-2">
                        <span className="text-amber-500">⚠️</span>
                        {t("failure_debrief.no_journal")}
                      </p>
                    )}
                    {todayContext.recentTriggers.length > 0 && (
                      <p className="text-sm flex items-center gap-2">
                        <span className="text-amber-500">⚠️</span>
                        {t("failure_debrief.triggers_logged", { count: todayContext.recentTriggers.length })}
                      </p>
                    )}
                    {todayContext.hasReflection &&
                      todayContext.hasJournal &&
                      todayContext.recentTriggers.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                          {t("failure_debrief.no_patterns")}
                        </p>
                      )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Step 3: What to Change */}
          {step === 3 && (
            <div className="space-y-4">
              {loadingSuggestions ? (
                <Card className="border-primary/30 bg-primary/5">
                  <CardContent className="p-4 flex items-center justify-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">
                      {t("failure_debrief.loading_suggestions")}
                    </span>
                  </CardContent>
                </Card>
              ) : aiSuggestions.length > 0 ? (
                <Card className="border-primary/30 bg-primary/5">
                  <CardHeader className="p-3 pb-1">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      {t("failure_debrief.ai_suggestions_title")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 space-y-2">
                    {aiSuggestions.map((suggestion, i) => (
                      <div
                        key={i}
                        className="text-sm p-2 rounded bg-background/50 border border-border/50"
                      >
                        {suggestion}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ) : null}

              <Card className="border-green-500/30 bg-green-500/5">
                <CardContent className="p-3">
                  <p className="text-sm text-green-700 dark:text-green-300">
                    🌱 {t("failure_debrief.encouragement")}
                  </p>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <Label>{t("failure_debrief.action_plan_label")}</Label>
                <Textarea
                  placeholder={t("failure_debrief.action_plan_placeholder")}
                  value={formData.action_plan}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, action_plan: e.target.value }))
                  }
                  className="min-h-[100px]"
                />
              </div>

              <Card className="border-border/50 bg-muted/30">
                <CardContent className="p-3">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">{t("failure_debrief.remember_label")}:</strong> {t("failure_debrief.remember_message")}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 pt-2 border-t border-border/50 flex items-center justify-between sticky bottom-0 bg-background">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={step === 1}
            className="gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            {t("failure_debrief.back")}
          </Button>

          {step < 3 ? (
            <Button onClick={handleNext} disabled={saving} className="gap-1">
              {t("failure_debrief.next")}
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={saving || !formData.action_plan}
              className="gap-1 bg-green-600 hover:bg-green-700"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              {t("failure_debrief.complete")}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
