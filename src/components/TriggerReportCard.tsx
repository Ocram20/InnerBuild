import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { it, enUS } from "date-fns/locale";
import { 
  Zap, 
  Sparkles, 
  AlertTriangle, 
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Clock,
  Lightbulb,
  Heart,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTriggerReport, TriggerCause, TimingPattern, TriggerSolution } from "@/hooks/useTriggerReport";
import { useTranslation } from "react-i18next";

export default function TriggerReportCard() {
  const dateLocale = i18n.language?.startsWith("it") ? it : enUS;
  const { 
    report, 
    loading, 
    generating, 
    generateReport, 
    markAsRead,
    canGenerateReport,
    getDaysUntilNextReport,
  } = useTriggerReport();
  const { i18n } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  if (loading) {
    return (
      <Card className="glass rounded-2xl border-blue-500/20 animate-pulse">
        <CardContent className="py-8">
          <div className="flex items-center justify-center gap-3">
            <Zap className="h-6 w-6 text-blue-500/50" />
            <span className="text-muted-foreground">{"Caricamento insight trigger..."}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const mainCauses = report?.detailed_analysis?.main_causes || [];
  const timingPatterns = report?.detailed_analysis?.timing_patterns || [];
  const solutions = report?.detailed_analysis?.solutions || [];
  const encouragement = report?.detailed_analysis?.encouragement || '';
  const daysUntilNext = getDaysUntilNextReport();

  // No report yet
  if (!report) {
    return (
      <Card className="glass rounded-2xl border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-cyan-500/5">
        <CardContent className="py-6">
          <div className="text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto">
              <Zap className="h-7 w-7 text-blue-500" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{"Ottieni il Tuo Report Trigger"}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {"Analizza i tuoi pattern trigger degli ultimi 4 giorni"}
              </p>
            </div>
            <Button
              onClick={generateReport}
              disabled={generating}
              className="gap-2 bg-blue-500 hover:bg-blue-600"
            >
              {generating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  {"Analisi..."}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  {"Genera Report"}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { summary, created_at, is_read, id } = report;

  return (
    <Card className={`glass rounded-2xl border-blue-500/20 ${!is_read ? 'ring-2 ring-blue-500/30' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
              <Zap className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">{"Analisi Trigger"}</CardTitle>
                {!is_read && (
                  <Badge variant="secondary" className="text-xs bg-blue-500/10 text-blue-500">
                    {"Nuovo"}
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
        {/* Summary */}
        <p className="text-sm text-foreground/90 leading-relaxed">
          {summary}
        </p>

        {/* Quick Stats */}
        {mainCauses.length > 0 && (
          <Badge variant="outline" className="gap-1 text-blue-600 border-blue-200 bg-blue-50/50">
            <AlertTriangle className="h-3 w-3" />
            {mainCauses.length > 1
              ? `${mainCauses.length} cause principali identificate`
              : `${mainCauses.length} causa principale identificata`}
          </Badge>
        )}

        {/* Expanded Details */}
        {expanded && (
          <div className="space-y-4 pt-2 border-t border-border/50">
            {/* Main Causes */}
            {mainCauses.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-blue-500" />
                  {"Cause Principali"}
                </h4>
                <div className="space-y-2">
                  {mainCauses.map((cause: TriggerCause, idx: number) => (
                    <div 
                      key={idx} 
                      className="rounded-lg bg-blue-50/50 dark:bg-blue-950/20 p-3 text-sm"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{cause.cause}</span>
                        <Badge variant="secondary" className="text-xs">
                          {cause.frequency}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {cause.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timing Patterns */}
            {timingPatterns.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-purple-500" />
                  {"Quando Succede"}
                </h4>
                <div className="space-y-2">
                  {timingPatterns.map((pattern: TimingPattern, idx: number) => (
                    <div 
                      key={idx} 
                      className="rounded-lg bg-purple-50/50 dark:bg-purple-950/20 p-3 text-sm"
                    >
                      <div className="font-medium mb-1">{pattern.when}</div>
                      <p className="text-xs text-muted-foreground">
                        {pattern.frequency} • {pattern.likely_reason}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Solutions */}
            {solutions.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-green-500" />
                  {"Soluzioni Suggerite"}
                </h4>
                <div className="space-y-2">
                  {solutions.map((solution: TriggerSolution, idx: number) => (
                    <div 
                      key={idx} 
                      className="rounded-lg bg-green-50/50 dark:bg-green-950/20 p-3 text-sm"
                    >
                      <div className="text-xs text-muted-foreground mb-1">
                        {`Per: ${solution.for_cause}`}
                      </div>
                      <div className="font-medium mb-1">{solution.strategy}</div>
                      <p className="text-xs text-muted-foreground">
                        {solution.why_it_helps}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Encouragement */}
            {encouragement && (
              <div className="rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 p-3">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-primary" />
                  <p className="text-sm text-foreground/90">{encouragement}</p>
                </div>
              </div>
            )}

            {/* Generate New Report Button */}
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
                      {"Generazione..."}
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      {"Genera Nuovo Report"}
                    </>
                  )}
                </Button>
              ) : (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-2">
                  <Clock className="h-4 w-4" />
                  {`Prossimo report disponibile tra ${daysUntilNext} giorno/i`}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
