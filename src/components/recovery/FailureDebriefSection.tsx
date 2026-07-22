import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, ChevronRight, History } from "lucide-react";
import { useFailureDebrief } from "@/hooks/useFailureDebrief";
import { FailureDebriefWizard } from "./FailureDebriefWizard";
import { FailureDebriefHistory } from "./FailureDebriefHistory";
import { useTranslation } from "react-i18next";

export function FailureDebriefSection() {
  const { t } = useTranslation();
  const {
    debriefs,
    todayContext,
    loading,
    saving,
    startDebrief,
    updateDebrief,
    getAISuggestions,
  } = useFailureDebrief();

  const [showWizard, setShowWizard] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [activeDebriefId, setActiveDebriefId] = useState<string | null>(null);

  const completedDebriefs = debriefs.filter((d) => d.is_completed);
  const incompleteDebrief = debriefs.find((d) => !d.is_completed);

  const handleStartDebrief = async () => {
    if (incompleteDebrief) {
      setActiveDebriefId(incompleteDebrief.id);
      setShowWizard(true);
      return;
    }

    const debrief = await startDebrief();
    if (debrief) {
      setActiveDebriefId(debrief.id);
      setShowWizard(true);
    }
  };

  const handleComplete = async () => {
    setShowWizard(false);
    setActiveDebriefId(null);
  };

  if (loading) {
    return (
      <Card className="border-border/50 bg-card/50">
        <CardContent className="p-6">
          <div className="animate-pulse h-24 bg-muted rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-border/60 bg-card/80 backdrop-blur-md shadow-xl overflow-hidden rounded-2xl">
        <CardHeader className="pb-3 pt-5 px-4 sm:px-6">
          <CardTitle className="flex items-center gap-2.5 text-base sm:text-lg font-bold text-foreground">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-[0_0_12px_rgba(244,63,94,0.15)]">
              <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <span>{t("failure_debrief.title")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-5 pt-1 space-y-4">
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {t("failure_debrief.description")}
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleStartDebrief}
              disabled={saving}
              className="flex-1 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-semibold shadow-lg shadow-rose-950/40 rounded-xl h-11 gap-1.5"
            >
              <span>{incompleteDebrief ? t("failure_debrief.continue") : t("failure_debrief.start")}</span>
              <ChevronRight className="w-4 h-4" />
            </Button>

            {completedDebriefs.length > 0 && (
              <Button
                variant="outline"
                onClick={() => setShowHistory(true)}
                className="flex items-center gap-2 h-11 rounded-xl border-border/60 bg-slate-900/40 hover:bg-slate-900/80"
              >
                <History className="w-4 h-4 text-muted-foreground" />
                <span className="hidden sm:inline text-xs">{t("failure_debrief.history")}</span>
                <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  {completedDebriefs.length}
                </span>
              </Button>
            )}
          </div>

          {incompleteDebrief && (
            <p className="text-xs text-amber-400 font-medium flex items-center gap-1.5">
              <span>⚠️</span> {t("failure_debrief.unfinished_notice")}
            </p>
          )}
        </CardContent>
      </Card>

      {showWizard && activeDebriefId && (
        <FailureDebriefWizard
          debriefId={activeDebriefId}
          todayContext={todayContext}
          onComplete={handleComplete}
          onClose={() => {
            setShowWizard(false);
            setActiveDebriefId(null);
          }}
          updateDebrief={updateDebrief}
          getAISuggestions={getAISuggestions}
          saving={saving}
        />
      )}

      {showHistory && (
        <FailureDebriefHistory
          debriefs={completedDebriefs}
          onClose={() => setShowHistory(false)}
        />
      )}
    </>
  );
}
