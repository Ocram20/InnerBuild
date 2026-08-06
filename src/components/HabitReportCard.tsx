import { useEffect, useState, useMemo } from "react";
import { 
  Zap, 
  Check, 
  X, 
  Brain, 
  Crown, 
  Lock, 
  Heart, 
  BookOpen, 
  Dumbbell, 
  Sparkles,
  RefreshCw,
  Sparkle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { usePremiumLimits } from "@/hooks/usePremiumLimits";
import PaywallModal from "@/components/PaywallModal";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { useHabitReport, HabitSuggestion } from "@/hooks/useHabitReport";

export default function HabitReportCard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { isPremium } = usePremiumLimits();
  const { toast } = useToast();
  
  const { 
    report, 
    loading, 
    generating, 
    generateReport, 
    acceptSuggestion, 
    dismissSuggestion,
    canGenerateReport,
  } = useHabitReport();

  const [showPaywall, setShowPaywall] = useState(false);
  const [applyingAll, setApplyingAll] = useState(false);

  const analyzedDays = useMemo(() => {
    if (!report?.period_start || !report?.period_end) return 4;
    const start = new Date(report.period_start);
    const end = new Date(report.period_end);
    const diff = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(1, diff);
  }, [report]);

  const rawSuggestions: HabitSuggestion[] = useMemo(() => {
    return report?.detailed_analysis?.habit_suggestions || [];
  }, [report]);

  const pendingSuggestions = useMemo(() => {
    return rawSuggestions.filter(s => s.status !== "accepted" && s.status !== "dismissed");
  }, [rawSuggestions]);

  const handleApplyAll = async () => {
    if (pendingSuggestions.length === 0) return;
    setApplyingAll(true);
    try {
      for (const suggestion of pendingSuggestions) {
        await acceptSuggestion(
          suggestion.habit_id,
          suggestion.suggested_title,
          suggestion.suggested_description || suggestion.reason
        );
      }
      toast({
        title: t("habit_report.all_applied_title", "Modalità Salvagente Attiva! ⚡"),
        description: t("habit_report.all_applied_desc", "Tutti gli aggiustamenti AI sono stati applicati per ritrovare il ritmo."),
      });
    } catch (err) {
      console.error("Error applying all suggestions:", err);
    } finally {
      setApplyingAll(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 dark:border-emerald-500/30 bg-card dark:bg-[#131922] p-6 animate-pulse">
        <div className="flex items-center justify-center gap-3">
          <Brain className="h-6 w-6 text-emerald-400" />
          <span className="text-muted-foreground dark:text-[#6c8093]">{t("habit_report.loading", "Caricamento AI Recovery Sprint...")}</span>
        </div>
      </div>
    );
  }

  if (!isPremium) {
    return (
      <>
        <div className="rounded-2xl border border-emerald-500/30 dark:border-emerald-500/30 bg-card dark:bg-[#131922] p-5 card-glow dark:card-lift">
          <div className="text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto relative shadow-soft">
              <Zap className="h-7 w-7 text-emerald-400" />
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-muted dark:bg-white/5 flex items-center justify-center border-2 border-background dark:border-[#0f1419]">
                <Lock className="h-2.5 w-2.5 text-muted-foreground dark:text-[#6c8093]" />
              </div>
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground dark:text-white">AI Recovery Sprint</h2>
              <p className="text-sm text-muted-foreground dark:text-[#6c8093] mt-1">
                {t("habit_report.sprint_subtitle", "Reset veloce sui tuoi pilastri per ritrovare l'inerzia.")}
              </p>
            </div>
            <Button onClick={() => setShowPaywall(true)} className="gap-2" variant="outline">
              <Crown className="h-4 w-4 text-emerald-400" />
              {t("habit_report.unlock_premium", "Sblocca con Premium")}
            </Button>
          </div>
        </div>
        <PaywallModal open={showPaywall} onOpenChange={setShowPaywall} reason="advanced_stats" />
      </>
    );
  }

  // If no report or no pending suggestions
  if (!report || pendingSuggestions.length === 0) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 dark:border-emerald-500/30 bg-card dark:bg-[#131922] p-4 space-y-3 shadow-lg backdrop-blur-md w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-emerald-400 fill-emerald-400 shrink-0" />
            <h2 className="text-base font-bold text-foreground dark:text-white">
              {t("habit_report.sprint_title", "AI Recovery Sprint")}
            </h2>
            <Badge variant="outline" className="text-[11px] font-semibold bg-rose-500/10 text-rose-500 dark:text-rose-400 border-rose-500/20 px-2 py-0.5 shrink-0">
              {report ? t("habit_report.analysis_days", { days: analyzedDays, defaultValue: `Analisi ${analyzedDays}d` }) : t("habit_report.every_4_days", "Ogni 4 Giorni")}
            </Badge>
          </div>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          {report 
            ? t("habit_report.no_delay", "Tutti gli aggiustamenti AI per l'ultimo periodo sono stati applicati! 🎉")
            : t("habit_report.sprint_subtitle", "Reset veloce sui tuoi pilastri per ritrovare l'inerzia.")}
        </p>

        {canGenerateReport() && (
          <Button
            onClick={generateReport}
            disabled={generating}
            className="w-full h-9 text-xs font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 gap-2 mt-2"
          >
            {generating ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkle className="h-4 w-4 fill-slate-950" />
            )}
            {t("habit_report.analyze_btn", "Analizza andamento abitudini con AI")}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-emerald-500/30 dark:border-emerald-500/30 bg-card dark:bg-[#131922] p-4 space-y-4 shadow-lg backdrop-blur-md w-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-emerald-400 fill-emerald-400 shrink-0" />
            <h2 className="text-base font-bold text-foreground dark:text-white">
              {t("habit_report.sprint_title", "AI Recovery Sprint")}
            </h2>
            <Badge variant="outline" className="text-[11px] font-semibold bg-rose-500/10 text-rose-500 dark:text-rose-400 border-rose-500/20 px-2 py-0.5 shrink-0">
              {t("habit_report.analysis_days", { days: analyzedDays, defaultValue: `Analisi ${analyzedDays}d` })}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground dark:text-slate-400 mt-0.5 leading-relaxed">
            {t("habit_report.sprint_subtitle", "Reset veloce sui tuoi pilastri per ritrovare l'inerzia.")}
          </p>
        </div>
      </div>

      {/* Habit Cards (AI Suggestions) */}
      <div className="space-y-3">
        {pendingSuggestions.map((suggestion) => {
          const aiAdvice = suggestion.suggested_description || suggestion.suggested_title || suggestion.reason || "Riduci l'obiettivo per ritrovare l'inerzia";

          const titleLower = suggestion.habit_title.toLowerCase();
          let ItemIcon = Sparkles;
          if (titleLower.includes("acqua") || titleLower.includes("salute") || titleLower.includes("sonno")) ItemIcon = Heart;
          else if (titleLower.includes("lettura") || titleLower.includes("studio") || titleLower.includes("piano") || titleLower.includes("suonare")) ItemIcon = BookOpen;
          else if (titleLower.includes("allenamento") || titleLower.includes("passi") || titleLower.includes("palestra")) ItemIcon = Dumbbell;

          return (
            <div
              key={suggestion.habit_id}
              className="p-3 rounded-xl border bg-muted/40 border-border/60 dark:bg-[#1a222e] dark:border-white/10 space-y-2 w-full transition-all"
            >
              {/* Top Row: Icon + Habit Title + Analyzed Days Badge + Actions */}
              <div className="flex items-center justify-between gap-2 w-full">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                    <ItemIcon className="h-3.5 w-3.5" />
                  </div>
                  <h3 className="text-xs font-semibold text-foreground dark:text-white break-words min-w-0 flex-1">
                    {suggestion.habit_title}
                  </h3>
                </div>

                {/* Analyzed Period Badge */}
                <div className="flex items-center gap-1 shrink-0 bg-muted/80 dark:bg-slate-900/60 px-2 py-0.5 rounded-md border border-border/60 dark:border-slate-800">
                  <span className="text-[10px] text-muted-foreground font-mono">{analyzedDays}d in calo</span>
                </div>

                {/* Action buttons [ ✓ ] e [ ✕ ] */}
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => acceptSuggestion(
                      suggestion.habit_id,
                      suggestion.suggested_title,
                      suggestion.suggested_description || suggestion.reason
                    )}
                    className="h-7 w-7 p-0 rounded-lg text-emerald-500 dark:text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-600 dark:hover:text-emerald-300"
                    title="Accetta aggiustamento AI"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => dismissSuggestion(suggestion.habit_id)}
                    className="h-7 w-7 p-0 rounded-lg text-muted-foreground hover:bg-muted"
                    title="Ignora"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* AI Advice Box: Full text readable, no truncation, no line-through strikethrough prefix */}
              <div className="text-xs bg-emerald-500/10 dark:bg-slate-900/80 px-3 py-2 rounded-lg border border-emerald-500/20 dark:border-slate-800/80 w-full text-emerald-700 dark:text-emerald-400 leading-relaxed font-medium break-words">
                {aiAdvice}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Primary CTA */}
      <Button
        onClick={handleApplyAll}
        disabled={applyingAll}
        className="w-full h-10 font-semibold text-xs rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-md transition-all flex items-center justify-center gap-2"
      >
        {applyingAll ? (
          <RefreshCw className="h-4 w-4 animate-spin" />
        ) : (
          <Zap className="h-4 w-4 fill-slate-950 text-slate-950" />
        )}
        ⚡ {t("habit_report.apply_all", "Applica Tutti gli Aggiustamenti")}
      </Button>
    </div>
  );
}




