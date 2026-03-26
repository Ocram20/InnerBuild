import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { it, enUS } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import { 
  Brain, 
  Sparkles, 
  TrendingDown, 
  Lightbulb,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Check,
  X,
  Clock,
  CheckCircle2,
  Lock,
  Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useHabitReport, HabitSuggestion } from "@/hooks/useHabitReport";
import { usePremiumLimits } from "@/hooks/usePremiumLimits";
import PaywallModal from "@/components/PaywallModal";

function SuggestionItem({
  suggestion,
  onAccept,
  onDismiss,
}: {
  suggestion: HabitSuggestion;
  onAccept: () => void;
  onDismiss: () => void;
}) {
  const { t } = useTranslation();
  const isHandled = suggestion.status === "accepted" || suggestion.status === "dismissed";

  return (
    <div className={`rounded-xl p-3 text-sm transition-opacity ${
      isHandled ? 'opacity-50 bg-muted/30' : 'bg-muted/50'
    }`}>
      <div className="flex items-center justify-between mb-1">
        <div className="min-w-0 mr-3">
          <span className="font-medium block truncate">{suggestion.habit_title}</span>
        </div>
        <Badge variant="secondary" className="text-xs shrink-0">
          {suggestion.current_completion_rate}% {t("common.completed")}
        </Badge>
      </div>
      <p className="text-muted-foreground text-xs mb-2">
        {suggestion.issue}
      </p>
      <div className="flex items-center gap-2 text-primary mb-3">
        <Lightbulb className="h-3 w-3 shrink-0" />
        <span className="text-xs font-medium">{suggestion.suggested_title}</span>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        {suggestion.suggested_description || suggestion.reason}
      </p>
      
      {!isHandled ? (
        <div className="flex items-center gap-2">
          <Button size="sm" className="h-7 px-3 gap-1" onClick={onAccept}>
            <Check className="h-3 w-3" />
            {t("common.accept")}
          </Button>
          <Button size="sm" variant="outline" className="h-7 px-3 gap-1" onClick={onDismiss}>
            <X className="h-3 w-3" />
            {t("common.dismiss")}
          </Button>
        </div>
      ) : (
        <Badge variant="outline" className={
          suggestion.status === "accepted" 
            ? "text-primary border-primary/30" 
            : "text-muted-foreground"
        }>
          {suggestion.status === "accepted" ? (
            <><CheckCircle2 className="h-3 w-3 mr-1" /> {t("common.applied")}</>
          ) : t("common.dismissed")}
        </Badge>
      )}
    </div>
  );
}

export default function HabitReportCard() {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language?.startsWith("it") ? it : enUS;
  const { isPremium } = usePremiumLimits();
  const { 
    report, 
    loading, 
    generating, 
    generateReport, 
    acceptSuggestion,
    dismissSuggestion,
    markAsRead,
    canGenerateReport,
    getDaysUntilNextReport,
  } = useHabitReport();
  const [expanded, setExpanded] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  if (loading) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card p-6 animate-pulse">
        <div className="flex items-center justify-center gap-3">
          <Brain className="h-6 w-6 text-primary/50" />
          <span className="text-muted-foreground">{t("habit_report.loading_insights")}</span>
        </div>
      </div>
    );
  }

  if (!isPremium) {
    return (
      <>
        <div className="rounded-2xl border border-border/60 bg-card p-5">
          <div className="text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto relative">
              <Brain className="h-7 w-7 text-primary" />
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-muted flex items-center justify-center border-2 border-background">
                <Lock className="h-2.5 w-2.5 text-muted-foreground" />
              </div>
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">{t("habit_report.habit_analysis")}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {t("habit_report.locked_desc")}
              </p>
            </div>
            <Button onClick={() => setShowPaywall(true)} className="gap-2" variant="outline">
              <Crown className="h-4 w-4 text-primary" />
              {t("habit_report.unlock_premium")}
            </Button>
          </div>
        </div>
        <PaywallModal open={showPaywall} onOpenChange={setShowPaywall} reason="advanced_stats" />
      </>
    );
  }

  const habitSuggestions = report?.detailed_analysis?.habit_suggestions || [];
  const tips = report?.detailed_analysis?.tips || [];
  const pendingSuggestions = habitSuggestions.filter(s => s.status !== "accepted" && s.status !== "dismissed");
  const daysUntilNext = getDaysUntilNextReport();

  if (!report) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card p-5">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <Brain className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">{t("habit_report.get_report")}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {t("habit_report.analyze_last_days")}
            </p>
          </div>
          <Button onClick={generateReport} disabled={generating} className="gap-2">
            {generating ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                {t("common.analyzing")}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                {t("trigger_tracking.generate_report")}
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  const { summary, created_at, is_read, id } = report;

  return (
    <div className={`rounded-2xl border border-border/60 bg-card p-5 overflow-hidden ${!is_read ? 'ring-2 ring-primary/30' : ''}`}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="break-words text-base font-semibold text-foreground">{t("habit_report.habit_analysis")}</h2>
              {!is_read && (
                <Badge variant="secondary" className="shrink-0 text-xs bg-primary/10 text-primary">
                  {t("common.new")}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(created_at), { addSuffix: true, locale: dateLocale })}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setExpanded(!expanded);
            if (!is_read) markAsRead(id);
          }}
          className="h-8 w-8 p-0"
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      <div className="space-y-4">
        <p className="break-words text-sm text-foreground/90 leading-relaxed">{summary}</p>

        {pendingSuggestions.length > 0 && (
          <Badge variant="outline" className="max-w-full gap-1 border-primary/20 text-primary whitespace-normal">
            <TrendingDown className="h-3 w-3" />
            {t("habit_report.suggestions_for_you", { count: pendingSuggestions.length })}
          </Badge>
        )}

        {expanded && (
          <div className="space-y-4 pt-2 border-t border-border/50">
            {habitSuggestions.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-primary" />
                  {t("habit_report.suggested_adjustments")}
                </h3>
                <div className="space-y-2">
                  {habitSuggestions.map((suggestion, idx) => (
                    <SuggestionItem
                      key={suggestion.habit_id || idx}
                      suggestion={suggestion}
                      onAccept={() => acceptSuggestion(
                        suggestion.habit_id,
                        suggestion.suggested_title,
                        suggestion.suggested_description || suggestion.reason
                      )}
                      onDismiss={() => dismissSuggestion(suggestion.habit_id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {tips.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  {t("habit_report.tips")}
                </h3>
                <ul className="space-y-1.5">
                  {tips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-primary font-medium">{idx + 1}.</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-2">
              {canGenerateReport() ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateReport}
                  disabled={generating}
                  className="w-full gap-2"
                >
                  {generating ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      {t("common.generating")}
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      {t("habit_report.generate_new")}
                    </>
                  )}
                </Button>
              ) : (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-2">
                  <Clock className="h-4 w-4" />
                  {t("habit_report.next_report_in", { days: daysUntilNext })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
