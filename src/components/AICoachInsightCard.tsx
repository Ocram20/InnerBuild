import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { it, enUS } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import { 
  Brain, 
  Sparkles, 
  TrendingDown, 
  AlertTriangle, 
  Lightbulb,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Check,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAIInsights, HabitAdaptation, TriggerPattern } from "@/hooks/useAIInsights";

export default function AICoachInsightCard() {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language?.startsWith("it") ? it : enUS;
  const { 
    latestInsight, 
    loading, 
    generating, 
    generateInsight, 
    markAsRead,
    shouldShowNewReport 
  } = useAIInsights();
  const [expanded, setExpanded] = useState(false);

  if (loading) {
    return (
      <Card className="glass rounded-2xl border-primary/20 animate-pulse">
        <CardContent className="py-8">
          <div className="flex items-center justify-center gap-3">
            <Brain className="h-6 w-6 text-primary/50" />
            <span className="text-muted-foreground">{t("ai_coach_insight.loading")}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No insight yet or time for a new one
  if (!latestInsight || shouldShowNewReport()) {
    return (
      <Card className="glass rounded-2xl border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardContent className="py-6">
          <div className="text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
              <Brain className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                {latestInsight ? t("ai_coach_insight.time_for_new") : t("ai_coach_insight.get_report")}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {latestInsight 
                  ? t("ai_coach_insight.days_since_last")
                  : t("ai_coach_insight.analyze_last_days")
                }
              </p>
            </div>
            <Button
              onClick={generateInsight}
              disabled={generating}
              className="gap-2"
            >
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
        </CardContent>
      </Card>
    );
  }

  const { detailed_analysis, recommendations, summary, created_at, is_read, id } = latestInsight;
  const habitAdaptations = detailed_analysis?.habit_adaptations || [];
  const triggerPatterns = detailed_analysis?.trigger_patterns || [];

  return (
    <Card className={`glass rounded-2xl border-primary/20 ${!is_read ? 'ring-2 ring-primary/30' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">{t("ai_coach_insight.title")}</CardTitle>
                {!is_read && (
                  <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                    {t("ai_coach_insight.new")}
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
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        <p className="text-sm text-foreground/90 leading-relaxed">
          {summary}
        </p>

        <div className="flex gap-2 flex-wrap">
          {habitAdaptations.length > 0 && (
            <Badge variant="outline" className="gap-1 text-orange-600 border-orange-200 bg-orange-50/50">
              <TrendingDown className="h-3 w-3" />
              {t("ai_coach_insight.habits_need_attention", { count: habitAdaptations.length })}
            </Badge>
          )}
          {triggerPatterns.length > 0 && (
            <Badge variant="outline" className="gap-1 text-blue-600 border-blue-200 bg-blue-50/50">
              <AlertTriangle className="h-3 w-3" />
              {t("ai_coach_insight.patterns_detected", { count: triggerPatterns.length })}
            </Badge>
          )}
        </div>

        {expanded && (
          <div className="space-y-4 pt-2 border-t border-border/50">
            {habitAdaptations.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-orange-500" />
                  {t("ai_coach_insight.suggested_adjustments")}
                </h4>
                <div className="space-y-2">
                  {habitAdaptations.map((adaptation: HabitAdaptation, idx: number) => (
                    <div 
                      key={idx} 
                      className="rounded-lg bg-orange-50/50 dark:bg-orange-950/20 p-3 text-sm"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{adaptation.habit_title}</span>
                        <Badge variant="secondary" className="text-xs">
                          {t("ai_coach_insight.completed", { rate: adaptation.current_completion_rate })}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-xs mb-2">
                        {adaptation.issue}
                      </p>
                      <div className="flex items-center gap-2 text-primary">
                        <Lightbulb className="h-3 w-3" />
                        <span className="text-xs font-medium">{adaptation.suggested_change}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {triggerPatterns.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-blue-500" />
                  {t("ai_coach_insight.trigger_patterns")}
                </h4>
                <div className="space-y-2">
                  {triggerPatterns.map((pattern: TriggerPattern, idx: number) => (
                    <div 
                      key={idx} 
                      className="rounded-lg bg-blue-50/50 dark:bg-blue-950/20 p-3 text-sm"
                    >
                      <div className="font-medium mb-1">{pattern.pattern}</div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {pattern.frequency}
                        {pattern.common_emotions?.length > 0 && (
                          <> • {t("ai_coach_insight.common_emotions", { emotions: pattern.common_emotions.join(', ') })}</>
                        )}
                      </p>
                      <div className="flex items-center gap-2 text-primary">
                        <Check className="h-3 w-3" />
                        <span className="text-xs">{pattern.prevention_tip}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {recommendations && recommendations.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  {t("ai_coach_insight.top_recommendations")}
                </h4>
                <ul className="space-y-1.5">
                  {recommendations.map((rec: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-primary font-medium">{idx + 1}.</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={generateInsight}
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
                  {t("ai_coach_insight.generate_new")}
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
