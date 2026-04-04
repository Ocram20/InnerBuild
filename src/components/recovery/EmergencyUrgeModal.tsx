import { useState } from "react";
import { AlertTriangle, Heart, Shield, Sparkles, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";

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

interface EmergencyUrgeModalProps {
  open: boolean;
  onClose: () => void;
}

export function EmergencyUrgeModal({ open, onClose }: EmergencyUrgeModalProps) {
  const { t, i18n } = useTranslation();
  const [step, setStep] = useState<Step>("feeling");
  const [feelingKey, setFeelingKey] = useState<string>("");
  const [locationKey, setLocationKey] = useState<string>("");
  const [alone, setAlone] = useState<boolean | null>(null);
  const [guidance, setGuidance] = useState<EmergencyGuidance | null>(null);

  const reset = () => {
    setStep("feeling");
    setFeelingKey("");
    setLocationKey("");
    setAlone(null);
    setGuidance(null);
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

      const feelingLabel = feelingKey ? t(`emergency_urge.feelings.${feelingKey}`) : "";
      const locationLabel = locationKey ? t(`emergency_urge.locations.${locationKey}`) : "";

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
            language: i18n.resolvedLanguage || i18n.language,
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
        <div className="sticky top-0 bg-background/95 backdrop-blur-sm p-4 border-b border-border/50 flex items-center justify-between">
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
                      setStep("location");
                    }}
                    className="px-4 py-2 rounded-full text-sm font-medium bg-muted/60 text-foreground hover:bg-muted transition-all"
                  >
                    {t(`emergency_urge.feelings.${key}`)}
                  </button>
                ))}
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
                      setStep("alone");
                    }}
                    className="px-4 py-2 rounded-full text-sm font-medium bg-muted/60 text-foreground hover:bg-muted transition-all"
                  >
                    {t(`emergency_urge.locations.${key}`)}
                  </button>
                ))}
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

              <Button
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClose();
                }}
              >
                {t("emergency_urge.close_button")}
              </Button>
              <p className="text-xs text-center text-muted-foreground">{t("emergency_urge.footer_note")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
