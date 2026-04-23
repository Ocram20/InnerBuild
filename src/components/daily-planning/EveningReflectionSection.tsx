import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Moon, Heart, Lightbulb, Save, Plus, X, Check, PartyPopper } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useTranslation } from "react-i18next";

interface DailyReflection {
  id?: string;
  day_summary: string | null;
  grateful_for: string[];
  lessons_learned: string | null;
  original_language?: string | null;
}

interface EveningReflectionSectionProps {
  userId: string | undefined;
  reflectionDate: string;
}


export function EveningReflectionSection({ userId, reflectionDate }: EveningReflectionSectionProps) {
  const [reflection, setReflection] = useState<DailyReflection>({
    day_summary: "",
    grateful_for: [],
    lessons_learned: "",
    original_language: null,
  });
  const [newGratitude, setNewGratitude] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showMotivation, setShowMotivation] = useState(false);
  const [motivationMessage, setMotivationMessage] = useState("");
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const MOTIVATIONAL_MESSAGES =
    t("evening_reflection_section.motivation_messages", { returnObjects: true }) as string[];

  useEffect(() => {
    if (userId) {
      fetchReflection();
    }
  }, [userId, reflectionDate]);

  const fetchReflection = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from("daily_reflections")
      .select("*")
      .eq("user_id", userId)
      .eq("reflection_date", reflectionDate)
      .maybeSingle();

    if (error) {
      console.error("Error fetching reflection:", error);
    } else if (data) {
      setReflection({
        id: data.id,
        day_summary: data.day_summary,
        grateful_for: data.grateful_for || [],
        lessons_learned: data.lessons_learned,
        original_language: (data as any).original_language,
      });
    }
    setLoading(false);
  };

  const addGratitude = () => {
    if (!newGratitude.trim() || reflection.grateful_for.length >= 3) return;
    setReflection({
      ...reflection,
      grateful_for: [...reflection.grateful_for, newGratitude.trim()],
    });
    setNewGratitude("");
    setHasUnsavedChanges(true);
  };

  const removeGratitude = (index: number) => {
    setReflection({
      ...reflection,
      grateful_for: reflection.grateful_for.filter((_, i) => i !== index),
    });
    setHasUnsavedChanges(true);
  };

  const updateField = (field: keyof DailyReflection, value: string) => {
    setReflection({ ...reflection, [field]: value });
    setHasUnsavedChanges(true);
  };

  const saveReflection = async () => {
    if (!userId) return;
    setSaving(true);

    const isComplete = 
      reflection.day_summary?.trim() && 
      reflection.grateful_for.length > 0 && 
      reflection.lessons_learned?.trim();

    const reflectionData = {
      user_id: userId,
      reflection_date: reflectionDate,
      day_summary: reflection.day_summary,
      grateful_for: reflection.grateful_for,
      lessons_learned: reflection.lessons_learned,
      original_language: reflection.original_language || i18n.resolvedLanguage || i18n.language || "it",
    };

    let error;
    if (reflection.id) {
      ({ error } = await supabase
        .from("daily_reflections")
        .update(reflectionData)
        .eq("id", reflection.id));
    } else {
      const { data, error: insertError } = await supabase
        .from("daily_reflections")
        .insert(reflectionData)
        .select()
        .single();
      error = insertError;
      if (data) {
        setReflection({ ...reflection, id: data.id });
      }
    }

    if (error) {
      toast({
        title: t("common.error"),
        description: t("evening_reflection.could_not_save"),
        variant: "destructive",
      });
    } else {
      setHasUnsavedChanges(false);
      
      // Show motivational message
      const randomMessage = MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)];
      setMotivationMessage(randomMessage);
      setShowMotivation(true);
      
      toast({
        title: t("evening_reflection.reflection_saved"),
        description: t("evening_reflection.reflection_saved_desc"),
      });


      // Hide motivation after 5 seconds
      setTimeout(() => setShowMotivation(false), 5000);
    }
    setSaving(false);
  };

  const isComplete = 
    reflection.day_summary?.trim() && 
    reflection.grateful_for.length > 0 && 
    reflection.lessons_learned?.trim();

  return (
    <Card className="glass shadow-card animate-slide-up border-2 border-primary/10" style={{ animationDelay: "0.3s" }}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-2 rounded-lg gradient-calm">
              <Moon className="h-5 w-5 text-primary-foreground" />
            </div>
            {t("evening_reflection.title")}
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasUnsavedChanges && (
              <span className="text-xs text-muted-foreground">{t("common.unsaved")}</span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-8"><LoadingSpinner /></div>
        ) : (
          <>
            {/* Motivational Message */}
            {showMotivation && (
              <div className="p-4 rounded-lg bg-success/10 border border-success/20 flex items-center gap-3 animate-scale-in">
                <PartyPopper className="h-6 w-6 text-success shrink-0" />
                <p className="text-sm font-medium text-success">{motivationMessage}</p>
              </div>
            )}

            {/* Day Summary */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Moon className="h-4 w-4 text-muted-foreground" />
                {t("evening_reflection.how_was_day")}
              </label>
              <Textarea
                placeholder={t("evening_reflection.day_placeholder")}
                value={reflection.day_summary || ""}
                onChange={(e) => updateField("day_summary", e.target.value)}
                className="min-h-20 resize-none"
              />
            </div>

            {/* Gratitude */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Heart className="h-4 w-4 text-pink-500" />
                {t("evening_reflection.grateful_for")}
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder={t("evening_reflection.grateful_placeholder")}
                  value={newGratitude}
                  onChange={(e) => setNewGratitude(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addGratitude()}
                  disabled={reflection.grateful_for.length >= 3}
                  className="flex-1"
                />
                <Button 
                  onClick={addGratitude} 
                  size="icon" 
                  variant="outline"
                  disabled={reflection.grateful_for.length >= 3}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {reflection.grateful_for.map((item, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-pink-500/10 text-pink-600 text-sm"
                  >
                    <Heart className="h-3 w-3" />
                    {item}
                    <button
                      onClick={() => removeGratitude(index)}
                      className="ml-1 hover:text-pink-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Lessons Learned */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                {t("evening_reflection.lessons_learned")}
              </label>
              <Textarea
                placeholder={t("evening_reflection.lessons_placeholder")}
                value={reflection.lessons_learned || ""}
                onChange={(e) => updateField("lessons_learned", e.target.value)}
                className="min-h-20 resize-none"
              />
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button 
                onClick={saveReflection} 
                disabled={saving || !hasUnsavedChanges || !(reflection.day_summary?.trim() || reflection.grateful_for.length > 0 || reflection.lessons_learned?.trim())}
                className="gap-2"
              >
                {saving ? (
                  <>{t("common.saving")}</>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {t("evening_reflection.save_reflection")}
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
