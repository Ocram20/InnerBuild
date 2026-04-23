import { format } from "date-fns";
import { enUS, it } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { X, ChevronDown, Calendar, CloudRain, AlertTriangle, Lightbulb } from "lucide-react";
import { FailureDebrief } from "@/hooks/useFailureDebrief";
import { useTranslation } from "react-i18next";
import { useDynamicTranslation } from "@/hooks/useDynamicTranslation";
import { useMemo } from "react";
interface FailureDebriefHistoryProps {
  debriefs: FailureDebrief[];
  onClose: () => void;
}

export function FailureDebriefHistory({
  debriefs,
  onClose,
}: FailureDebriefHistoryProps) {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === "it" ? it : enUS;
  const rawDebriefStrings = useMemo(() => debriefs.flatMap((debrief) => {
    const values = [
      debrief.context,
      debrief.trigger,
      debrief.signal_details,
      debrief.action_plan,
      ...(debrief.ai_suggestions ?? []),
    ];
    return values.filter((v): v is string => typeof v === "string" && v.trim().length > 0);
  }), [debriefs]);
  
  const { display } = useDynamicTranslation(rawDebriefStrings, debriefs[0]?.original_language);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-lg max-h-[90vh] overflow-hidden p-0 gap-0 [&>button]:hidden">
        <DialogHeader className="p-4 pb-2 border-b border-border/50 relative">
          <div className="flex items-center justify-between gap-2">
            <DialogTitle className="text-lg font-semibold flex-1">
              {t("failure_debrief.history_title", "Debrief History")}
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 shrink-0 -mr-2">
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {t("failure_debrief.history_subtitle", "Review your past debriefs and identify recurring patterns")}
          </p>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[70vh]">
          <div className="p-4 space-y-3">
            {debriefs.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {t("failure_debrief.no_completed", "No completed debriefs yet.")}
              </p>
            ) : (
              debriefs.map((debrief) => (
                <Collapsible key={debrief.id}>
                  <Card className="border-border/50">
                    <CollapsibleTrigger asChild>
                      <CardHeader className="p-3 cursor-pointer hover:bg-muted/30 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium text-sm">
                              {format(new Date(debrief.debrief_date), "PPP", { locale: dateLocale })}
                            </span>
                            {debrief.mood && (
                              <span className="text-sm">
                                {t(`failure_debrief.moods.${debrief.mood}`, "").split(" ")[0] || debrief.mood}
                              </span>
                            )}
                          </div>
                          <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="p-3 pt-0 space-y-3 border-t border-border/30">
                        {/* What Happened */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground uppercase tracking-wide">
                            <CloudRain className="w-3 h-3" />
                            {t("failure_debrief.what_happened", "What happened?")}
                          </div>
                          {debrief.mood && (
                            <p className="text-sm">
                              <span className="text-muted-foreground">{t("failure_debrief.mood", "Mood")}:</span>{" "}
                              {t(`failure_debrief.moods.${debrief.mood}`, debrief.mood)}
                            </p>
                          )}
                          {debrief.context && (
                            <p className="text-sm">
                              <span className="text-muted-foreground">{t("failure_debrief.context", "Context")}:</span>{" "}
                              {display(debrief.context)}
                            </p>
                          )}
                          {debrief.trigger && (
                            <p className="text-sm">
                              <span className="text-muted-foreground">{t("failure_debrief.trigger", "Trigger")}:</span>{" "}
                              {display(debrief.trigger)}
                            </p>
                          )}
                        </div>

                        {/* Signal Ignored */}
                        {debrief.ignored_signal && (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground uppercase tracking-wide">
                              <AlertTriangle className="w-3 h-3" />
                              {t("failure_debrief.first_ignored_signal", "First ignored signal")}
                            </div>
                            <p className="text-sm">
                              {t(`failure_debrief.signals.${debrief.ignored_signal}`, debrief.ignored_signal)}
                            </p>
                            {debrief.signal_details && (
                              <p className="text-sm text-muted-foreground">
                                {display(debrief.signal_details)}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Action Plan */}
                        {debrief.action_plan && (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground uppercase tracking-wide">
                              <Lightbulb className="w-3 h-3" />
                              {t("failure_debrief.next_time_action_plan", "Your action plan for next time")}
                            </div>
                            <p className="text-sm bg-green-500/10 p-2 rounded border border-green-500/20">
                              {display(debrief.action_plan)}
                            </p>
                          </div>
                        )}

                        {/* AI Suggestions */}
                        {debrief.ai_suggestions && debrief.ai_suggestions.length > 0 && (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground uppercase tracking-wide">
                              <span>✨</span>
                              {t("failure_debrief.ai_suggestions_title", "AI Coach suggestions")}
                            </div>
                            <div className="space-y-1">
                              {debrief.ai_suggestions.map((suggestion, i) => (
                                <p
                                  key={i}
                                  className="text-xs p-2 rounded bg-primary/5 border border-primary/10"
                                >
                                  {display(suggestion)}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
