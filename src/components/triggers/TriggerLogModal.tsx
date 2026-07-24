import { useState, useEffect } from "react";
import { Zap, Heart, MapPin, Users, FileText, AlertCircle, Plus, X } from "lucide-react";
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
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { normalizeBadHabitName, COMMON_BAD_HABIT_PRESETS } from "@/lib/habitNormalizer";

interface TriggerLogModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    bad_habit?: string;
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
  const { user } = useAuth();
  
  const [badHabit, setBadHabit] = useState("");
  const [customBadHabit, setCustomBadHabit] = useState("");
  const [isCustomHabitSelected, setIsCustomHabitSelected] = useState(false);
  const [activeHabitPills, setActiveHabitPills] = useState<Array<{ name: string; icon: string }>>([]);
  const [customNamesList, setCustomNamesList] = useState<string[]>([]);

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

  useEffect(() => {
    if (user && open) {
      fetchActiveDetoxChallenges();
    }
  }, [user, open]);

  const fetchActiveDetoxChallenges = async () => {
    if (!user) return;
    try {
      const pillsMap = new Map<string, string>();
      const customLoaded: string[] = [];

      // 1. Fetch user's active detox challenges normalized
      const { data } = await supabase
        .from("detox_challenges")
        .select("title, category")
        .eq("user_id", user.id)
        .eq("status", "active");

      if (data && data.length > 0) {
        data.forEach(ch => {
          const norm = normalizeBadHabitName(ch.title, ch.category);
          let icon = "🔥";
          if (norm.includes("Social")) icon = "📱";
          else if (norm.includes("Porn")) icon = "🔞";
          else if (norm.includes("Junk") || norm.includes("Cibo")) icon = "🍔";
          else if (norm.includes("Fumo")) icon = "🚬";
          else if (norm.includes("Video")) icon = "🎮";
          else if (norm.includes("Alcol")) icon = "🍺";
          pillsMap.set(norm, icon);
        });
      }

      // 2. Load custom user-added bad habits from localStorage
      try {
        const savedCustom = localStorage.getItem("innerbuild_custom_bad_habits");
        if (savedCustom) {
          const parsed: string[] = JSON.parse(savedCustom);
          parsed.forEach(item => {
            if (item && item.trim()) {
              const nameTrimmed = item.trim();
              pillsMap.set(nameTrimmed, "⚡");
              if (!customLoaded.includes(nameTrimmed)) {
                customLoaded.push(nameTrimmed);
              }
            }
          });
        }
      } catch (err) {
        console.error("Error reading saved custom bad habits:", err);
      }

      setCustomNamesList(customLoaded);

      const list = Array.from(pillsMap.entries()).map(([name, icon]) => ({ name, icon }));
      setActiveHabitPills(list);

      // Auto-select first active challenge if badHabit is empty
      if (!badHabit && list.length > 0) {
        setBadHabit(list[0].name);
      }
    } catch (err) {
      console.error("Error fetching active detox challenges for triggers:", err);
    }
  };

  const handleAddCustomHabit = () => {
    const trimmed = customBadHabit.trim();
    if (!trimmed) return;

    // Add to customNamesList if not already present
    if (!customNamesList.includes(trimmed)) {
      const newCustomList = [...customNamesList, trimmed];
      setCustomNamesList(newCustomList);

      // Save custom habits to localStorage
      try {
        localStorage.setItem("innerbuild_custom_bad_habits", JSON.stringify(newCustomList));
      } catch (err) {
        console.error("Error saving custom bad habits:", err);
      }
    }

    // Check if not already in activeHabitPills
    if (!activeHabitPills.some(p => p.name.toLowerCase() === trimmed.toLowerCase())) {
      const newList = [...activeHabitPills, { name: trimmed, icon: "⚡" }];
      setActiveHabitPills(newList);
    }

    setBadHabit(trimmed);
    setCustomBadHabit("");
    setIsCustomHabitSelected(false);
  };

  const handleRemoveCustomHabit = (nameToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent pill selection when clicking remove X

    const updatedCustomList = customNamesList.filter(n => n.toLowerCase() !== nameToRemove.toLowerCase());
    setCustomNamesList(updatedCustomList);

    const updatedPills = activeHabitPills.filter(p => p.name.toLowerCase() !== nameToRemove.toLowerCase());
    setActiveHabitPills(updatedPills);

    // Save to localStorage
    try {
      localStorage.setItem("innerbuild_custom_bad_habits", JSON.stringify(updatedCustomList));
    } catch (err) {
      console.error("Error updating saved custom bad habits:", err);
    }

    // Reset selection if removed item was active
    if (badHabit === nameToRemove) {
      if (updatedPills.length > 0) {
        setBadHabit(updatedPills[0].name);
      } else {
        setBadHabit("");
      }
    }
  };

  const getTimeContext = (): string => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "morning";
    if (hour >= 12 && hour < 17) return "afternoon";
    if (hour >= 17 && hour < 21) return "evening";
    return "night";
  };

  const handleSubmit = async () => {
    const finalBadHabit = isCustomHabitSelected ? customBadHabit.trim() : badHabit;
    if (!finalBadHabit || !emotion || !situation) return;
    
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
      bad_habit: finalBadHabit,
      impulse_intensity: intensity,
      emotion,
      situation,
      time_context: getTimeContext(),
      location_context: location || undefined,
      was_alone: wasAlone,
      notes: enhancedNotes || undefined,
    });

    if (success) {
      setBadHabit("");
      setCustomBadHabit("");
      setIsCustomHabitSelected(false);
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

  const finalBadHabit = isCustomHabitSelected ? customBadHabit.trim() : badHabit;
  const isValid = !!finalBadHabit && emotion && situation && 
    (emotion !== "other" || customEmotion.trim()) &&
    (situation !== "other" || customSituation.trim()) &&
    (location !== "other" || customLocation.trim());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-[#4D87D9]" />
            {t("trigger_tracking.log_trigger")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Bad Habit Selection - Exact matching modal UI style */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              A quale cattiva abitudine è legata questa tentazione? *
            </label>

            {/* Bad Habit Pills */}
            <div className="flex flex-wrap gap-2">
              {activeHabitPills.map((pill) => {
                const isSelected = !isCustomHabitSelected && badHabit === pill.name;
                const isCustomUserAdded = customNamesList.some(c => c.toLowerCase() === pill.name.toLowerCase());

                return (
                  <button
                    key={pill.name}
                    type="button"
                    onClick={() => {
                      setBadHabit(pill.name);
                      setIsCustomHabitSelected(false);
                    }}
                    className={`px-3 py-2 rounded-xl text-sm transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-[#4D87D9] text-white font-medium shadow-md"
                        : "bg-muted/50 hover:bg-muted text-foreground"
                    }`}
                  >
                    <span>{pill.icon}</span>
                    <span>{pill.name}</span>
                    {isCustomUserAdded && (
                      <span
                        onClick={(e) => handleRemoveCustomHabit(pill.name, e)}
                        className="ml-1 p-0.5 rounded-full hover:bg-red-500/20 hover:text-red-400 opacity-70 hover:opacity-100 transition-all"
                        title="Rimuovi abitudine"
                      >
                        <X className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </button>
                );
              })}

              {/* Custom Habit Pill */}
              <button
                type="button"
                onClick={() => setIsCustomHabitSelected(true)}
                className={`px-3 py-2 rounded-xl text-sm transition-all flex items-center gap-1.5 ${
                  isCustomHabitSelected
                    ? "bg-[#4D87D9] text-white font-medium shadow-md"
                    : "bg-muted/50 hover:bg-muted text-foreground"
                }`}
              >
                <Plus className="h-4 w-4" />
                <span>Altra abitudine</span>
              </button>
            </div>

            {/* Free Text Input + Add Button */}
            {isCustomHabitSelected && (
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  value={customBadHabit}
                  onChange={(e) => setCustomBadHabit(e.target.value)}
                  placeholder="Es. Fumo, Videogiochi, Shopping..."
                  className="flex-1 px-3 py-2 rounded-xl border border-border bg-background text-sm"
                  autoFocus
                />
                <Button
                  type="button"
                  onClick={handleAddCustomHabit}
                  disabled={!customBadHabit.trim()}
                  size="sm"
                  className="rounded-xl px-3 h-9 bg-[#4D87D9] hover:bg-[#3b6eb8] text-white font-medium"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Aggiungi
                </Button>
              </div>
            )}
          </div>

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
              rangeClassName="bg-[#4D87D9]"
              thumbClassName="border-[#4D87D9] bg-[#4D87D9]"
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
                      ? "bg-[#4D87D9] text-white font-medium shadow-md scale-105"
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
                      ? "bg-[#4D87D9] text-white font-medium shadow-md"
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
                    location === id ? "bg-[#4D87D9] text-white font-medium shadow-sm" : "bg-muted/50 hover:bg-muted"
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
                  wasAlone ? "bg-[#4D87D9] text-white font-medium shadow-sm" : "bg-muted/50 hover:bg-muted"
                }`}
              >
                {t("trigger_tracking.yes_alone")}
              </button>
              <button
                type="button"
                onClick={() => setWasAlone(false)}
                className={`flex-1 py-2 rounded-xl text-sm transition-all ${
                  !wasAlone ? "bg-[#4D87D9] text-white font-medium shadow-sm" : "bg-muted/50 hover:bg-muted"
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
            className="w-full bg-[#4D87D9] hover:bg-[#3b6eb8] text-white font-semibold shadow-soft"
          >
            {submitting ? t("common.saving") : t("trigger_tracking.log_trigger")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
