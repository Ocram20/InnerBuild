import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Smile, Meh, Frown, Heart, Sparkles, Loader2, Edit3 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useDynamicTranslation } from "@/hooks/useDynamicTranslation";
import { useMemo } from "react";

interface Reflection {
  id: string;
  prompt: string;
  content: string;
  mood: string | null;
  reflection_date: string;
  original_language: string;
}

interface ReflectionCardProps {
  reflection: Reflection | null;
  prompt: string;
  onUpdate: () => void;
}

const moodOptions = [
  { value: "great", icon: Sparkles, label: "Great", color: "text-primary" },
  { value: "good", icon: Smile, label: "Good", color: "text-primary/70" },
  { value: "okay", icon: Meh, label: "Okay", color: "text-muted-foreground" },
  { value: "low", icon: Frown, label: "Low", color: "text-accent" },
  { value: "struggling", icon: Heart, label: "Need support", color: "text-destructive" },
];

export default function ReflectionCard({ reflection, prompt, onUpdate }: ReflectionCardProps) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [content, setContent] = useState(reflection?.content || "");
  const [mood, setMood] = useState<string | null>(reflection?.mood || null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(!reflection);

  const rawStrings = useMemo(() => [reflection?.content].filter((v): v is string => typeof v === "string" && v.trim().length > 0), [reflection?.content]);
  const { display } = useDynamicTranslation(rawStrings, reflection?.original_language);

  const displayContent = reflection ? display(reflection.content) : "";

  const saveReflection = async () => {
    if (!user || !content.trim()) return;
    
    setIsLoading(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      
      if (reflection) {
        await supabase
          .from("reflections")
          .update({
            content: content.trim(),
            mood,
            original_language: i18n.resolvedLanguage || i18n.language || "it",
          })
          .eq("id", reflection.id);
      } else {
        await supabase
          .from("reflections")
          .insert({
            user_id: user.id,
            prompt,
            content: content.trim(),
            mood,
            reflection_date: today,
            original_language: i18n.resolvedLanguage || i18n.language || "it",
          });
      }
      
      toast({
        title: "Reflection saved",
        description: "Thank you for taking time to reflect 🙏",
      });
      
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile salvare la riflessione",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass rounded-2xl p-5 shadow-card">
      <p className="text-foreground font-medium text-lg leading-snug mb-4">{prompt}</p>
      
      {isEditing ? (
        <div className="space-y-4">
          {/* Mood selector */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">How are you feeling?</p>
            <div className="flex gap-1.5 flex-wrap">
              {moodOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setMood(option.value)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-full border-2 transition-all text-sm ${
                    mood === option.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <option.icon className={`h-4 w-4 ${option.color}`} />
                  <span className="hidden sm:inline">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Text area */}
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Take a moment to reflect..."
            className="min-h-[100px] rounded-xl resize-none text-[15px]"
          />
          
          {/* Actions */}
          <div className="flex gap-2">
            {reflection && (
              <Button
                variant="ghost"
                onClick={() => {
                  setIsEditing(false);
                  setContent(reflection.content);
                  setMood(reflection.mood);
                }}
                className="rounded-xl flex-1"
              >
                Cancel
              </Button>
            )}
            <Button
              onClick={saveReflection}
              disabled={!content.trim() || isLoading}
              className="gradient-primary text-primary-foreground rounded-xl shadow-soft flex-1"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
          </div>
        </div>
      ) : (
        <div>
          {/* Show saved reflection */}
          {reflection && (
            <div className="space-y-3">
              {reflection.mood && (
                <div className="flex items-center gap-2">
                  {(() => {
                    const option = moodOptions.find(o => o.value === reflection.mood);
                    if (!option) return null;
                    return (
                      <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted text-sm ${option.color}`}>
                        <option.icon className="h-4 w-4" />
                        {option.label}
                      </span>
                    );
                  })()}
                </div>
              )}
              <p className="text-foreground whitespace-pre-wrap leading-relaxed">{displayContent}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="rounded-xl text-muted-foreground hover:text-foreground"
              >
                <Edit3 className="h-4 w-4 mr-1.5" />
                Edit
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
