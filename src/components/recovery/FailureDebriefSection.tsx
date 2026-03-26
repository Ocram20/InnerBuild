import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, ChevronRight, History } from "lucide-react";
import { useFailureDebrief } from "@/hooks/useFailureDebrief";
import { FailureDebriefWizard } from "./FailureDebriefWizard";
import { FailureDebriefHistory } from "./FailureDebriefHistory";
export function FailureDebriefSection() {
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
      <Card className="border-border/50 bg-gradient-to-br from-card to-card/80 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Heart className="w-4 h-4 text-primary" />
            </div>
            {"Debrief dopo la ricaduta"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {"Hai avuto una ricaduta? Va bene—fa parte del percorso. Trasformiamo questa esperienza in un'occasione di crescita."}
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleStartDebrief}
              disabled={saving}
              className="flex-1 bg-primary/90 hover:bg-primary"
            >
              {incompleteDebrief ? "Continua Debrief" : "Inizia Debrief"}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>

            {completedDebriefs.length > 0 && (
              <Button
                variant="outline"
                onClick={() => setShowHistory(true)}
                className="flex items-center gap-2"
              >
                <History className="w-4 h-4" />
                <span className="hidden sm:inline">{"Cronologia"}</span>
                <span className="text-xs bg-muted px-1.5 py-0.5 rounded">
                  {completedDebriefs.length}
                </span>
              </Button>
            )}
          </div>

          {incompleteDebrief && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              {"Hai un debrief non completato. Continua quando sei pronto."}
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
