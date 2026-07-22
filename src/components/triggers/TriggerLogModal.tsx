import { useState } from "react";
import { Zap, Heart, MapPin, Users, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";

interface TriggerLogModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    impulse_intensity: number;
    emotion: string;
    situation: string;
    time_context: string;
    location_context?: string;
    was_alone: boolean;
    notes?: string;
  }) => Promise<boolean>;
}

const EMOTION_IDS = ["stress", "boredom", "sadness", "anxiety", "anger", "loneliness", "tiredness", "excitement", "other"] as const;
const EMOTION_EMOJI: Record<(typeof EMOTION_IDS)[number], string> = {
  stress: "😰",
  boredom: "😑",
  sadness: "😢",
  anxiety: "😟",
  anger: "😠",
  loneliness: "😔",
  tiredness: "😴",
  excitement: "🤩",
  other: "📝",
};

const SITUATION_IDS = [
  "social_media",
  "video_streaming",
  "after_argument",
  "before_sleep",
  "work_break",
  "weekend",
  "procrastination",
  "other",
] as const;

const LOCATION_IDS = ["home", "work", "commute", "other"] as const;

export default function TriggerLogModal({ open, onOpenChange, onSubmit }: TriggerLogModalProps) {
  const { t } = useTranslation();
  const [intensity, setIntensity] = useState(5);
  const [emotion, setEmotion] = useState("");
  const [customEmotion, setCustomEmotion] = useState("");
  const [situation, setSituation] = useState("");
  const [customSituation, setCustomSituation] = useState("");
  const [location, setLocation] = useState("");
  const [customLocation, setCustomLocation] = useState("");
  const [wasAlone, setWasAlone] = useState(true);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const getTimeContext = (): string => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "morning";
    if (hour >= 12 && hour < 17) return "afternoon";
    if (hour >= 17 && hour < 21) return "evening";
    return "night";
  };

  const handleSubmit = async () => {
    if (!emotion || !situation) return;
    
    // Validate custom inputs for 'other' options
    if (emotion === "other" && !customEmotion.trim()) {
      return;
    }
    if (situation === "other" && !customSituation.trim()) {
      return;
    }
    if (location === "other" && !customLocation.trim()) {
      return;
    }

    setSubmitting(true);
    
    // Build notes with custom context if provided
    let enhancedNotes = notes.trim();
    const customDetails = [];
    if (emotion === "other" && customEmotion.trim()) {
      customDetails.push(`Emozione: ${customEmotion.trim()}`);
    }
    if (situation === "other" && customSituation.trim()) {
      customDetails.push(`Situazione: ${customSituation.trim()}`);
    }
    if (location === "other" && customLocation.trim()) {
      customDetails.push(`Luogo: ${customLocation.trim()}`);
    }
    if (customDetails.length > 0) {
      enhancedNotes = enhancedNotes ? `${enhancedNotes}\n\n${customDetails.join("\n")}` : customDetails.join("\n");
    }

    const success = await onSubmit({
      impulse_intensity: intensity,
      emotion,
      situation,
      time_context: getTimeContext(),
      location_context: location || undefined,
      was_alone: wasAlone,
      notes: enhancedNotes || undefined,
    });

    if (success) {
      setIntensity(5);
      setEmotion("");
      setCustomEmotion("");
      setSituation("");
      setCustomSituation("");
      setLocation("");
      setCustomLocation("");
      setWasAlone(true);
      setNotes("");
      onOpenChange(false);
    }
    setSubmitting(false);
  };

  const isValid = emotion && situation && 
    (emotion !== "other" || customEmotion.trim()) &&
    (situation !== "other" || customSituation.trim()) &&
    (location !== "other" || customLocation.trim());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            {t("trigger_tracking.log_trigger")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-orange-500" />
              {t("trigger_tracking.impulse_intensity")}: {intensity}/10
            </label>
            <Slider
              value={[intensity]}
              onValueChange={(v) => setIntensity(v[0])}
              min={1}
              max={10}
              step={1}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{t("trigger_tracking.heatmap_legend.mild")}</span>
              <span>{t("trigger_tracking.heatmap_legend.strong")}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Heart className="h-4 w-4 text-rose-500" />
              {t("trigger_tracking.how_feel")}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {EMOTION_IDS.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setEmotion(id)}
                  className={`p-2 rounded-xl text-center transition-all ${
                    emotion === id
                      ? "bg-primary text-primary-foreground shadow-md scale-105"
                      : "bg-muted/50 hover:bg-muted"
                  }`}
                >
                  <span className="text-lg">{EMOTION_EMOJI[id] || "📝"}</span>
                  <p className="text-[10px] mt-0.5 truncate">{t(`trigger_tracking.emotions.${id}`)}</p>
                </button>
              ))}
            </div>
            {emotion === "other" && (
              <div className="mt-2">
                <input
                  type="text"
                  value={customEmotion}
                  onChange={(e) => setCustomEmotion(e.target.value)}
                  placeholder={t("trigger_tracking.specify_emotion")}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                  required
                />
                {!customEmotion.trim() && (
                  <p className="text-xs text-destructive mt-1">{t("trigger_tracking.required_field")}</p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t("trigger_tracking.situation")}</label>
            <div className="grid grid-cols-2 gap-2">
              {SITUATION_IDS.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSituation(id)}
                  className={`p-2.5 rounded-xl text-sm text-left transition-all ${
                    situation === id
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-muted/50 hover:bg-muted"
                  }`}
                >
                  {t(`trigger_tracking.situations.${id}`)}
                </button>
              ))}
            </div>
            {situation === "other" && (
              <div className="mt-2">
                <input
                  type="text"
                  value={customSituation}
                  onChange={(e) => setCustomSituation(e.target.value)}
                  placeholder={t("trigger_tracking.specify_situation")}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                  required
                />
                {!customSituation.trim() && (
                  <p className="text-xs text-destructive mt-1">{t("trigger_tracking.required_field")}</p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-500" />
              {t("trigger_tracking.where_are_you")}
            </label>
            <div className="flex gap-2 flex-wrap">
              {LOCATION_IDS.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setLocation(id)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                    location === id ? "bg-primary text-primary-foreground" : "bg-muted/50 hover:bg-muted"
                  }`}
                >
                  {t(`trigger_tracking.locations.${id}`)}
                </button>
              ))}
            </div>
            {location === "other" && (
              <div className="mt-2">
                <input
                  type="text"
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  placeholder={t("trigger_tracking.specify_location")}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                  required
                />
                {!customLocation.trim() && (
                  <p className="text-xs text-destructive mt-1">{t("trigger_tracking.required_field")}</p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-500" />
              {t("trigger_tracking.are_you_alone")}
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setWasAlone(true)}
                className={`flex-1 py-2 rounded-xl text-sm transition-all ${
                  wasAlone ? "bg-primary text-primary-foreground" : "bg-muted/50 hover:bg-muted"
                }`}
              >
                {t("trigger_tracking.yes_alone")}
              </button>
              <button
                type="button"
                onClick={() => setWasAlone(false)}
                className={`flex-1 py-2 rounded-xl text-sm transition-all ${
                  !wasAlone ? "bg-primary text-primary-foreground" : "bg-muted/50 hover:bg-muted"
                }`}
              >
                {t("trigger_tracking.no_with_others")}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-500" />
              {t("trigger_tracking.notes_optional")}
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("trigger_tracking.notes_placeholder")}
              className="resize-none"
              rows={2}
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!isValid || submitting}
            className="w-full gradient-primary text-primary-foreground"
          >
            {submitting ? t("common.saving") : t("trigger_tracking.log_trigger")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
