import { useState } from "react";
import { untypedTable } from "@/integrations/supabase/untyped-client";
import { useToast } from "@/hooks/use-toast";
import { Brain, Footprints, MessageCircle, Check, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTranslation } from "react-i18next";
interface DailyEntry {
  id: string;
  day_number: number;
  phase_name: string | null;
  coach_message: string | null;
  mental_mission: string | null;
  behavioral_mission: string | null;
  mental_mission_completed: boolean;
  behavioral_mission_completed: boolean;
  checkin_response: string | null;
  is_failure: boolean;
}

interface DailyContentCardProps {
  entry: DailyEntry | null;
  isLoading: boolean;
  isCurrentDay: boolean;
  challengeId?: string;
  jokersRemaining?: number;
  onUpdate: () => void;
}

const checkinOptions = [
  { value: "tough", labelKey: "daily_content.tough", emoji: "😤" },
  { value: "manageable", labelKey: "daily_content.manageable", emoji: "😌" },
  { value: "strong", labelKey: "daily_content.strong", emoji: "💪" },
];

export default function DailyContentCard({ entry, isLoading, isCurrentDay, challengeId, jokersRemaining = 3, onUpdate }: DailyContentCardProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [savingMission, setSavingMission] = useState<string | null>(null);
  const [savingCheckin, setSavingCheckin] = useState(false);
  const [showSetbackDialog, setShowSetbackDialog] = useState(false);

  if (isLoading) {
    return (
      <Card className="glass rounded-2xl">
        <CardContent className="p-6 flex items-center justify-center min-h-[200px]">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!entry) return null;

  const toggleMission = async (type: "mental" | "behavioral") => {
    if (!isCurrentDay) return;
    setSavingMission(type);
    const field = type === "mental" ? "mental_mission_completed" : "behavioral_mission_completed";
    const current = type === "mental" ? entry.mental_mission_completed : entry.behavioral_mission_completed;

    await untypedTable("challenge_daily_entries")
      .update({ [field]: !current })
      .eq("id", entry.id);

    onUpdate();
    setSavingMission(null);
  };

  const submitCheckin = async (value: string) => {
    if (!isCurrentDay || entry.checkin_response) return;
    setSavingCheckin(true);

    await untypedTable("challenge_daily_entries")
      .update({ checkin_response: value })
      .eq("id", entry.id);

    toast({
      title: "Check-in salvato",
      description: "Ottimo lavoro nel riflettere sulla tua giornata.",
    });
    onUpdate();
    setSavingCheckin(false);
  };

  const reportFailure = async () => {
    if (!isCurrentDay || !challengeId) return;
    setSavingCheckin(true);

    // Mark entry as failure
    await untypedTable("challenge_daily_entries")
      .update({ is_failure: true, checkin_response: "setback" })
      .eq("id", entry.id);

    // Consume a joker — does NOT advance the day
    const newJokers = Math.max(0, jokersRemaining - 1);
    const updates: Record<string, any> = { jokers_remaining: newJokers };

    // If all jokers used, auto-pause
    if (newJokers <= 0) {
      updates.status = "paused";
    }

    await untypedTable("detox_challenges")
      .update(updates)
      .eq("id", challengeId);

    if (newJokers <= 0) {
      toast({
        title: "Challenge paused",
        description: "No jokers remaining. Resume or reset to continue.",
      });
    } else {
      toast({
        title: "It's okay",
        description: `Joker used (${newJokers} remaining). The day doesn't advance — you'll retry this day.`,
      });
    }

    onUpdate();
    setSavingCheckin(false);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Phase indicator */}
      {entry.phase_name && (
        <div className="px-3 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-medium w-fit">
          {entry.phase_name} — {t("challenge_card.day_of", {
            current: entry.day_number,
            total: "{{total}}",
          }).replace("{{total}}", String(entry.day_number))}
        </div>
      )}

      {/* Coach message */}
      {entry.coach_message && (
        <Card className="glass rounded-2xl border-none shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <MessageCircle className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  {"Il Tuo Coach"}
                </p>
                <p className="text-sm text-foreground leading-relaxed">{entry.coach_message}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Missions */}
      <div className="grid gap-3">
        {entry.mental_mission && (
          <button
            onClick={() => toggleMission("mental")}
            disabled={!isCurrentDay || savingMission === "mental"}
            className={`w-full text-left glass rounded-2xl p-4 transition-all duration-300 ${
              entry.mental_mission_completed ? "ring-1 ring-primary/30 bg-primary/5" : ""
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                entry.mental_mission_completed ? "bg-primary text-primary-foreground" : "bg-muted"
              }`}>
                {entry.mental_mission_completed ? <Check className="h-4 w-4" /> : <Brain className="h-4 w-4 text-muted-foreground" />}
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-0.5">
                  {"Missione Mentale"}
                </p>
                <p className="text-sm text-foreground">{entry.mental_mission}</p>
              </div>
            </div>
          </button>
        )}

        {entry.behavioral_mission && (
          <button
            onClick={() => toggleMission("behavioral")}
            disabled={!isCurrentDay || savingMission === "behavioral"}
            className={`w-full text-left glass rounded-2xl p-4 transition-all duration-300 ${
              entry.behavioral_mission_completed ? "ring-1 ring-accent/30 bg-accent/5" : ""
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                entry.behavioral_mission_completed ? "bg-accent text-accent-foreground" : "bg-muted"
              }`}>
                {entry.behavioral_mission_completed ? <Check className="h-4 w-4" /> : <Footprints className="h-4 w-4 text-muted-foreground" />}
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-0.5">
                  {"Missione Comportamentale"}
                </p>
                <p className="text-sm text-foreground">{entry.behavioral_mission}</p>
              </div>
            </div>
          </button>
        )}
      </div>

      {/* End-of-day check-in */}
      {isCurrentDay && !entry.checkin_response && (
        <Card className="glass rounded-2xl border-none shadow-soft">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-foreground mb-3">
              {"Com'è andata oggi?"}
            </p>
            <div className="flex gap-2">
              {checkinOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => submitCheckin(opt.value)}
                  disabled={savingCheckin}
                  className="flex-1 py-3 rounded-xl bg-muted hover:bg-muted/80 transition-all text-center"
                >
                  <span className="text-lg">{opt.emoji}</span>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t(opt.labelKey)}
                  </p>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowSetbackDialog(true)}
              disabled={savingCheckin}
              className="w-full mt-3 py-2 text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              {"Ho avuto una ricaduta oggi"}
            </button>
          </CardContent>
        </Card>
      )}

      {/* Already checked in */}
      {entry.checkin_response && entry.checkin_response !== "setback" && (
        <div className="text-center py-2">
          <p className="text-xs text-muted-foreground">
            {"Hai fatto il check-in:"}{" "}
            <span className="font-medium text-foreground">
              {checkinOptions.find(o => o.value === entry.checkin_response)?.emoji}{" "}
              {t(
                checkinOptions.find(o => o.value === entry.checkin_response)
                  ?.labelKey || "daily_content.manageable"
              )}
            </span>
          </p>
        </div>
      )}

      {entry.is_failure && (
        <div className="text-center py-3 px-4 rounded-xl bg-muted/50">
          <p className="text-xs text-muted-foreground">
            {"Hai avuto una ricaduta questo giorno. Un jolly è stato usato — riproverai questo giorno. 🤍"}
          </p>
        </div>
      )}

      {/* Setback confirmation dialog */}
      <AlertDialog open={showSetbackDialog} onOpenChange={setShowSetbackDialog}>
        <AlertDialogContent className="rounded-2xl max-w-sm mx-4">
          <AlertDialogHeader>
            <AlertDialogTitle>{"Sei sicuro?"}</AlertDialogTitle>
            <AlertDialogDescription className="text-sm leading-relaxed">
              {`Segnalare una ricaduta userà 1 jolly (${jokersRemaining} rimanenti). Il giorno non avanzerà — riproverai questo giorno.`}{" "}
              {jokersRemaining <= 1 && (
                <span className="block mt-2 font-medium text-destructive">
                  {"⚠️ Questo è il tuo ultimo jolly. Usarlo metterà in pausa la sfida."}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">
              {"Torna indietro"}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                setShowSetbackDialog(false);
                reportFailure();
              }} 
              className="rounded-xl bg-destructive/80 hover:bg-destructive text-destructive-foreground"
            >
              {"Sì, ho avuto una ricaduta"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
