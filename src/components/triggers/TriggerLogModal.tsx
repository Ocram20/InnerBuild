import { useState } from "react";
import { X, Zap, Heart, MapPin, Users, FileText } from "lucide-react";
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

export default function TriggerLogModal({ open, onOpenChange, onSubmit }: TriggerLogModalProps) {
  const { t } = useTranslation();
  const [intensity, setIntensity] = useState(5);
  const [emotion, setEmotion] = useState("");
  const [situation, setSituation] = useState("");
  const [location, setLocation] = useState("");
  const [wasAlone, setWasAlone] = useState(true);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const emotions = [
    { id: "stress", label: t("trigger_tracking.emotions.stress"), emoji: "😰" },
    { id: "boredom", label: t("trigger_tracking.emotions.boredom"), emoji: "😑" },
    { id: "sadness", label: t("trigger_tracking.emotions.sadness"), emoji: "😢" },
    { id: "anxiety", label: t("trigger_tracking.emotions.anxiety"), emoji: "😟" },
    { id: "anger", label: t("trigger_tracking.emotions.anger"), emoji: "😠" },
    { id: "loneliness", label: t("trigger_tracking.emotions.loneliness"), emoji: "😔" },
    { id: "tiredness", label: t("trigger_tracking.emotions.tiredness"), emoji: "😴" },
    { id: "excitement", label: t("trigger_tracking.emotions.excitement"), emoji: "🤩" },
  ];

  const situations = [
    { id: "social_media", label: t("trigger_tracking.situations.social_media") },
    { id: "video_streaming", label: t("trigger_tracking.situations.video_streaming") },
    { id: "after_argument", label: t("trigger_tracking.situations.after_argument") },
    { id: "before_sleep", label: t("trigger_tracking.situations.before_sleep") },
    { id: "work_break", label: t("trigger_tracking.situations.work_break") },
    { id: "weekend", label: t("trigger_tracking.situations.weekend") },
    { id: "procrastination", label: t("trigger_tracking.situations.procrastination") },
    { id: "other", label: t("trigger_tracking.situations.other") },
  ];

  const locations = [
    { id: "home", label: t("trigger_tracking.locations.home") },
    { id: "work", label: t("trigger_tracking.locations.work") },
    { id: "commute", label: t("trigger_tracking.locations.commute") },
    { id: "other", label: t("trigger_tracking.situations.other") },
  ];

  const getTimeContext = (): string => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "morning";
    if (hour >= 12 && hour < 17) return "afternoon";
    if (hour >= 17 && hour < 21) return "evening";
    return "night";
  };

  const handleSubmit = async () => {
    if (!emotion || !situation) return;

    setSubmitting(true);
    const success = await onSubmit({
      impulse_intensity: intensity,
      emotion,
      situation,
      time_context: getTimeContext(),
      location_context: location || undefined,
      was_alone: wasAlone,
      notes: notes.trim() || undefined,
    });

    if (success) {
      setIntensity(5);
      setEmotion("");
      setSituation("");
      setLocation("");
      setWasAlone(true);
      setNotes("");
      onOpenChange(false);
    }
    setSubmitting(false);
  };

  const isValid = emotion && situation;

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
              {emotions.map((e) => (
                <button
                  key={e.id}
                  onClick={() => setEmotion(e.id)}
                  className={`p-2 rounded-xl text-center transition-all ${
                    emotion === e.id
                      ? "bg-primary text-primary-foreground shadow-md scale-105"
                      : "bg-muted/50 hover:bg-muted"
                  }`}
                >
                  <span className="text-lg">{e.emoji}</span>
                  <p className="text-[10px] mt-0.5 truncate">{e.label}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t("trigger_tracking.situation")} *</label>
            <div className="grid grid-cols-2 gap-2">
              {situations.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSituation(s.id)}
                  className={`p-2.5 rounded-xl text-sm text-left transition-all ${
                    situation === s.id
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-muted/50 hover:bg-muted"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-500" />
              {t("trigger_tracking.where_are_you")}
            </label>
            <div className="flex gap-2 flex-wrap">
              {locations.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setLocation(l.id)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                    location === l.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/50 hover:bg-muted"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-500" />
              {t("trigger_tracking.are_you_alone")}
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setWasAlone(true)}
                className={`flex-1 py-2 rounded-xl text-sm transition-all ${
                  wasAlone
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 hover:bg-muted"
                }`}
              >
                {t("trigger_tracking.yes_alone")}
              </button>
              <button
                onClick={() => setWasAlone(false)}
                className={`flex-1 py-2 rounded-xl text-sm transition-all ${
                  !wasAlone
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 hover:bg-muted"
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
