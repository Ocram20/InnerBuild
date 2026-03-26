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
  const [intensity, setIntensity] = useState(5);
  const [emotion, setEmotion] = useState("");
  const [situation, setSituation] = useState("");
  const [location, setLocation] = useState("");
  const [wasAlone, setWasAlone] = useState(true);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const emotions = [
    { id: "stress", label: "Stress", emoji: "😰" },
    { id: "boredom", label: "Noia", emoji: "😑" },
    { id: "sadness", label: "Tristezza", emoji: "😢" },
    { id: "anxiety", label: "Ansia", emoji: "😟" },
    { id: "anger", label: "Rabbia", emoji: "😠" },
    { id: "loneliness", label: "Solitudine", emoji: "😔" },
    { id: "tiredness", label: "Stanchezza", emoji: "😴" },
    { id: "excitement", label: "Eccitazione", emoji: "🤩" },
  ];

  const situations = [
    { id: "social_media", label: "Social media" },
    { id: "video_streaming", label: "Video/streaming" },
    { id: "after_argument", label: "Dopo un litigio" },
    { id: "before_sleep", label: "Prima di dormire" },
    { id: "work_break", label: "Pausa lavoro" },
    { id: "weekend", label: "Weekend libero" },
    { id: "procrastination", label: "Procrastinazione" },
    { id: "other", label: "Altro" },
  ];

  const locations = [
    { id: "home", label: "Casa" },
    { id: "work", label: "Lavoro" },
    { id: "commute", label: "Tragitto" },
    { id: "other", label: "Altro" },
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
            {"Registra Trigger"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-orange-500" />
              {"Intensità impulso"}: {intensity}/10
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
              <span>{"Lieve (1-3)"}</span>
              <span>{"Forte (7-10)"}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Heart className="h-4 w-4 text-rose-500" />
              {"Come ti senti? *"}
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
            <label className="text-sm font-medium">{"Situazione *"} *</label>
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
              {"Dove sei?"}
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
              {"Sei solo?"}
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
                {"Sì, solo"}
              </button>
              <button
                onClick={() => setWasAlone(false)}
                className={`flex-1 py-2 rounded-xl text-sm transition-all ${
                  !wasAlone
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 hover:bg-muted"
                }`}
              >
                {"No, con altri"}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-500" />
              {"Note (opzionale)"}
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={"Cosa stava succedendo? Cosa stavi pensando?"}
              className="resize-none"
              rows={2}
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!isValid || submitting}
            className="w-full gradient-primary text-primary-foreground"
          >
            {submitting ? "Salvataggio..." : "Registra Trigger"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
