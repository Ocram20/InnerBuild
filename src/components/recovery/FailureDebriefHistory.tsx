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
interface FailureDebriefHistoryProps {
  debriefs: FailureDebrief[];
  onClose: () => void;
}

export function FailureDebriefHistory({
  const { t, i18n } = useTranslation();
  debriefs,
  onClose,
}: FailureDebriefHistoryProps) {
  const dateLocale = i18n.language === "it" ? it : enUS;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-lg max-h-[90vh] overflow-hidden p-0 gap-0 [&>button]:hidden">
        <DialogHeader className="p-4 pb-2 border-b border-border/50 relative">
          <div className="flex items-center justify-between gap-2">
            <DialogTitle className="text-lg font-semibold flex-1">
              {"Cronologia Debrief"}
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 shrink-0 -mr-2">
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {"Rivedi i tuoi debrief passati e individua i pattern"}
          </p>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[70vh]">
          <div className="p-4 space-y-3">
            {debriefs.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {"Nessun debrief completato ancora."}
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
                            {"Cosa è successo?"}
                          </div>
                          {debrief.mood && (
                            <p className="text-sm">
                              <span className="text-muted-foreground">{"Umore"}:</span>{" "}
                              {t(`failure_debrief.moods.${debrief.mood}`, debrief.mood)}
                            </p>
                          )}
                          {debrief.context && (
                            <p className="text-sm">
                              <span className="text-muted-foreground">{"Contesto"}:</span>{" "}
                              {debrief.context}
                            </p>
                          )}
                          {debrief.trigger && (
                            <p className="text-sm">
                              <span className="text-muted-foreground">{"Trigger"}:</span>{" "}
                              {debrief.trigger}
                            </p>
                          )}
                        </div>

                        {/* Signal Ignored */}
                        {debrief.ignored_signal && (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground uppercase tracking-wide">
                              <AlertTriangle className="w-3 h-3" />
                              {"Primo segnale ignorato"}
                            </div>
                            <p className="text-sm">
                              {t(`failure_debrief.signals.${debrief.ignored_signal}`, debrief.ignored_signal)}
                            </p>
                            {debrief.signal_details && (
                              <p className="text-sm text-muted-foreground">
                                {debrief.signal_details}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Action Plan */}
                        {debrief.action_plan && (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground uppercase tracking-wide">
                              <Lightbulb className="w-3 h-3" />
                              {"Il tuo piano d'azione per la prossima volta"}
                            </div>
                            <p className="text-sm bg-green-500/10 p-2 rounded border border-green-500/20">
                              {debrief.action_plan}
                            </p>
                          </div>
                        )}

                        {/* AI Suggestions */}
                        {debrief.ai_suggestions && debrief.ai_suggestions.length > 0 && (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground uppercase tracking-wide">
                              ✨ {"Suggerimenti del Coach AI"}
                            </div>
                            <div className="space-y-1">
                              {debrief.ai_suggestions.map((suggestion, i) => (
                                <p
                                  key={i}
                                  className="text-xs p-2 rounded bg-primary/5 border border-primary/10"
                                >
                                  {suggestion}
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
