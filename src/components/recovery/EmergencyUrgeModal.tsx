import { useState } from "react";
import { AlertTriangle, ArrowRight, Heart, Shield, Sparkles, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
type Step = "feeling" | "location" | "alone" | "loading" | "guidance";

const feelingKeys = [
  "stressed", "bored", "lonely", "anxious", "sad",
  "frustrated", "tired", "restless", "overwhelmed",
];

const locationKeys = [
  "home_bedroom", "home_living", "work", "school", "public", "bathroom", "other",
];

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
  const { user } = useAuth();
  const [step, setStep] = useState<Step>("feeling");
  const [feeling, setFeeling] = useState("");
  const [location, setLocation] = useState("");
  const [alone, setAlone] = useState<boolean | null>(null);
  const [guidance, setGuidance] = useState<EmergencyGuidance | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setStep("feeling");
    setFeeling("");
    setLocation("");
    setAlone(null);
    setGuidance(null);
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const fetchGuidance = async () => {
    setStep("loading");
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/emergency-urge`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ feeling, location, alone, language: i18n.language }),
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
          "Fai una doccia fredda",
          "Esci a camminare o correre",
          "Fai esercizio fisico",
        ],
        personal_reminder: "Sei più forte di questo momento.",
        calming_message: "Questo impulso è intenso ma temporaneo. Passerà entro 15-20 minuti. Respira e lascia che l'onda passi.",
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
        {/* Header */}
        <div className="sticky top-0 bg-background/95 backdrop-blur-sm p-4 border-b border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-rose-500/15 flex items-center justify-center">
              <Shield className="w-4 h-4 text-rose-500" />
            </div>
            <span className="font-semibold text-foreground">
              {"Supporto d'emergenza"}
            </span>
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
          {/* Step: Feeling */}
          {step === "feeling" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {"Come ti senti in questo momento?"}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {"Nessun giudizio — dimmi cosa sta succedendo."}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {feelingKeys.map((key) => (
                  <button
                    key={key}
                    onClick={(e) => {
                      e.stopPropagation();
                      setFeeling(t(`emergency_urge.feelings.${key}`));
                      setStep("location");
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      feeling === t(`emergency_urge.feelings.${key}`)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/60 text-foreground hover:bg-muted"
                    }`}
                  >
                    {t(`emergency_urge.feelings.${key}`)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step: Location */}
          {step === "location" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {"Dove ti trovi?"}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {"Questo mi aiuta a suggerirti le azioni giuste."}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {locationKeys.map((key) => (
                  <button
                    key={key}
                    onClick={(e) => {
                      e.stopPropagation();
                      setLocation(t(`emergency_urge.locations.${key}`));
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

          {/* Step: Alone */}
          {step === "alone" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {"Sei da solo in questo momento?"}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {"Questo aiuta a personalizzare i consigli per te."}
                </p>
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
                  {"Sì, sono solo"}
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
                  {"No, con altre persone"}
                </Button>
              </div>
            </div>
          )}

          {/* Step: Loading */}
          {step === "loading" && (
            <div className="flex flex-col items-center justify-center py-12 gap-4 animate-in fade-in duration-200">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <div className="text-center">
                <p className="font-medium text-foreground">
                  {"Sto preparando i tuoi consigli..."}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {"Fai un respiro profondo mentre preparo tutto."}
                </p>
              </div>
            </div>
          )}

          {/* Step: Guidance */}
          {step === "guidance" && guidance && (
            <div className="space-y-5 animate-in fade-in duration-300">
              {/* Calming message */}
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <Heart className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm text-foreground leading-relaxed">
                      {guidance.calming_message}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Immediate actions */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  {"Fai questo adesso"}
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

              {/* Personal reminder */}
              <Card className="border-amber-500/20 bg-amber-500/5">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">
                        {"Ricorda il tuo perché"}
                      </p>
                      <p className="text-sm text-foreground leading-relaxed">
                        {guidance.personal_reminder}
                      </p>
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
                {"Mi sento meglio"}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                {"L'impulso passerà. Ce la puoi fare. 💪"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
