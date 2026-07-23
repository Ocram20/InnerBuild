import { useState, useEffect, useMemo } from "react";
import { Heart, Plus, Trash2, Loader2, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { useUiBatchTranslation } from "@/hooks/useUiBatchTranslation";

const SUGGESTED_KEYS = ["sr1", "sr2", "sr3", "sr4", "sr5", "sr6", "sr7", "sr8"] as const;

/** Sentinel date for storing quit reasons in journal_entries (column is a real date, not arbitrary text). */
const QUIT_REASONS_ENTRY_DATE = "2000-01-01";

export function ReasonsSection() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [reasons, setReasons] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newReason, setNewReason] = useState("");
  const shouldTranslateContent = (i18n.resolvedLanguage || i18n.language || "it").toLowerCase().split("-")[0] !== "it";

  const suggestedReasons = useMemo(
    () => SUGGESTED_KEYS.map((key) => t(`reasons_section.${key}`)),
    [t]
  );
  const rawReasons = reasons.filter((v): v is string => typeof v === "string" && v.trim().length > 0);
  const { display } = useUiBatchTranslation(rawReasons, shouldTranslateContent && rawReasons.length > 0);

  useEffect(() => {
    if (user) {
      loadReasons();
    }
  }, [user]);

  const loadReasons = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("user_id", user.id)
        .eq("entry_date", QUIT_REASONS_ENTRY_DATE)
        .maybeSingle();

      if (data?.content) {
        try {
          const parsed = JSON.parse(data.content);
          setReasons(parsed);
        } catch {
          setReasons([]);
        }
      }
    } catch (error) {
      console.error("Error loading reasons:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveReasons = async (updatedReasons: string[]) => {
    if (!user) return;
    
    setSaving(true);
    try {
      const { data: existing } = await supabase
        .from("journal_entries")
        .select("id")
        .eq("user_id", user.id)
        .eq("entry_date", QUIT_REASONS_ENTRY_DATE)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("journal_entries")
          .update({ content: JSON.stringify(updatedReasons) })
          .eq("id", existing.id);
      } else {
        await supabase
          .from("journal_entries")
          .insert({
            user_id: user.id,
            entry_date: QUIT_REASONS_ENTRY_DATE,
            content: JSON.stringify(updatedReasons),
          });
      }
      
      setReasons(updatedReasons);
    } catch (error) {
      toast({
        title: t("reasons_section.error_saving_title"),
        description: t("reasons_section.error_saving_desc"),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const addReason = (reason: string) => {
    if (!reason.trim()) return;
    if (reasons.includes(reason.trim())) {
      toast({
        title: t("reasons_section.already_added_title"),
        description: t("reasons_section.already_added_desc"),
      });
      return;
    }

    const updatedReasons = [...reasons, reason.trim()];
    saveReasons(updatedReasons);
    setNewReason("");
  };

  const removeReason = (index: number) => {
    const updatedReasons = reasons.filter((_, i) => i !== index);
    saveReasons(updatedReasons);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60 bg-card/80 backdrop-blur-md shadow-xl overflow-hidden rounded-2xl">
      <CardHeader className="pb-3 pt-5 px-4 sm:px-6">
        <CardTitle className="flex items-center gap-2.5 text-base sm:text-lg font-bold text-foreground">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-[0_0_12px_rgba(168,85,247,0.15)]">
            <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <span>{t("reasons_section.title")}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 pb-5 pt-1 space-y-4">
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{t("reasons_section.description")}</p>

        {/* User's reasons */}
        {reasons.length > 0 && (
          <div className="space-y-2">
            {reasons.map((reason, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-purple-500/20 shadow-sm group hover:border-purple-500/40 transition-all"
              >
                <Sparkles className="h-4 w-4 text-purple-400 shrink-0" />
                <p className="text-xs sm:text-sm text-foreground flex-1 font-medium leading-snug">
                  {shouldTranslateContent ? display(reason) : reason}
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-70 group-hover:opacity-100 transition-opacity shrink-0 hover:bg-rose-500/10 hover:text-rose-400"
                  onClick={() => removeReason(index)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Add custom reason */}
        <div className="space-y-2">
          <Textarea
            placeholder={t("reasons_section.new_placeholder")}
            value={newReason}
            onChange={(e) => setNewReason(e.target.value)}
            className="min-h-[70px] text-xs sm:text-sm bg-slate-950/60 border-border/60 rounded-xl focus:border-purple-500/50"
          />
          <Button 
            size="sm" 
            onClick={() => addReason(newReason)}
            disabled={saving || !newReason.trim()}
            className="w-full bg-[#C377D7] hover:bg-[#C377D7]/90 dark:bg-[#D28CE4] text-white font-semibold rounded-xl h-10 gap-1.5 shadow-md shadow-purple-950/40"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            <span>{t("reasons_section.add_my_reason")}</span>
          </Button>
        </div>

        {/* Suggested reasons */}
        <div>
          <p className="text-xs text-muted-foreground mb-2 font-medium">{t("reasons_section.suggested_prompt")}</p>
          <div className="flex flex-wrap gap-1.5">
            {suggestedReasons
              .filter(r => !reasons.includes(r))
              .map((reason) => (
                <button
                  key={reason}
                  onClick={() => addReason(reason)}
                  className="text-xs px-3 py-1.5 rounded-full bg-slate-900/60 border border-border/40 hover:border-purple-500/40 text-muted-foreground hover:text-purple-300 transition-all font-medium"
                >
                  + {reason}
                </button>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
