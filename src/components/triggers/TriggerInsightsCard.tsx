import { AlertTriangle, Lightbulb, TrendingUp, Sparkles, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TriggerInsight } from "@/hooks/useTriggerTracking";

interface TriggerInsightsCardProps {
  insights: TriggerInsight[];
  analyzing: boolean;
  onAnalyze: () => void;
  logsCount: number;
}

const insightIcons: Record<string, React.ElementType> = {
  pattern: TrendingUp,
  warning: AlertTriangle,
  suggestion: Lightbulb,
};

const insightColors: Record<string, string> = {
  pattern: "text-blue-500 bg-blue-500/10",
  warning: "text-orange-500 bg-orange-500/10",
  suggestion: "text-primary bg-primary/10",
};

export default function TriggerInsightsCard({
  insights,
  analyzing,
  onAnalyze,
  logsCount,
}: TriggerInsightsCardProps) {
  return (
    <Card className="glass rounded-2xl border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">AI Insights</CardTitle>
              <p className="text-xs text-muted-foreground">
                {logsCount} triggers logged
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={onAnalyze}
            disabled={analyzing || logsCount < 3}
            className="h-8"
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${analyzing ? "animate-spin" : ""}`} />
            {analyzing ? "Analyzing..." : "Analyze"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {logsCount < 3 ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Log at least 3 triggers to unlock AI insights
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {3 - logsCount} more needed
            </p>
          </div>
        ) : insights.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground">
              Press "Analyze" to generate insights from your patterns
            </p>
          </div>
        ) : (
          insights.map((insight) => {
            const Icon = insightIcons[insight.insight_type] || Lightbulb;
            const colorClass = insightColors[insight.insight_type] || insightColors.suggestion;

            return (
              <div
                key={insight.id}
                className="rounded-xl border border-border/50 bg-muted/20 p-3"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-foreground mb-0.5">
                      {insight.title}
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {insight.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
