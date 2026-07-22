import { useMemo, useState } from "react";
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
import { useUiBatchTranslation } from "@/hooks/useUiBatchTranslation";
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
  manualCheckInDone?: boolean;
}

const checkinOptions = [
  { value: "tough", labelKey: "daily_content.tough", emoji: "😤" },
  { value: "manageable", labelKey: "daily_content.manageable", emoji: "😌" },
  { value: "strong", labelKey: "daily_content.strong", emoji: "💪" },
];

export default function DailyContentCard({ entry, isLoading, isCurrentDay, challengeId, jokersRemaining = 3, onUpdate, manualCheckInDone = false }: DailyContentCardProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [savingMission, setSavingMission] = useState<string | null>(null);
  const [savingCheckin, setSavingCheckin] = useState(false);
  const [showSetbackDialog, setShowSetbackDialog] = useState(false);

  const rawAiStrings = useMemo(() => {
    if (!entry) return [];
    return [entry.coach_message, entry.mental_mission, entry.behavioral_mission].filter(
      (v): v is string => typeof v === "string" && v.trim().length > 0
    );
  }, [entry]);
  const { display } = useUiBatchTranslation(
    rawAiStrings,
    !isLoading && !!entry && rawAiStrings.length > 0
  );

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
  const phaseLabel =
    entry.phase_name
      ? (() => {
          const raw = entry.phase_name.trim().toLowerCase();
          const map: Record<string, string> = {
            acute: "challenge_journey.phases.acute",
            "acute phase": "challenge_journey.phases.acute",
            stabilization: "challenge_journey.phases.stabilization",
            "stabilization phase": "challenge_journey.phases.stabilization",
            reconstruction: "challenge_journey.phases.reconstruction",
            "reconstruction phase": "challenge_journey.phases.reconstruction",
            consolidation: "challenge_journey.phases.consolidation",
            "consolidation phase": "challenge_journey.phases.consolidation",
          };
          const key = map[raw];
          return key ? t(key) : entry.phase_name;
        })()
      : null;

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

    // Auto check-in for the challenge when difficulty is selected
    if (challengeId) {
      const today = new Date().toISOString().split("T")[0];
      await untypedTable("detox_challenges")
        .update({ last_check_in: today })
        .eq("id", challengeId);
    }

    toast({
      title: t("daily_content.checkin_saved"),
      description: t("daily_content.great_reflecting"),
    });
    onUpdate();
    setSavingCheckin(false);
  };

  const reportFailure = async () => {
    if (!isCurrentDay || !challengeId) return;
    setSavingCheckin(true);

    // Mark entry as failure - check-in fails
    await untypedTable("challenge_daily_entries")
      .update({ is_failure: true, checkin_response: "setback" })
      .eq("id", entry.id);

    // Consume a joker — visual indicator will empty
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
        title: t("challenge_card.challenge_paused"),
        description: t("challenge_card.no_jokers_warning"),
      });
    } else {
      toast({
        title: t("daily_content.setback_today"),
        description: t("daily_content.setback_message"),
      });
    }

    onUpdate();
    setSavingCheckin(false);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Phase indicator */}
      {phaseLabel && (
        <div className="px-3 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-medium w-fit">
          {phaseLabel} — {t("challenge_card.day_of", {
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
                  {t("daily_content.your_coach")}
                </p>
                <p className="text-sm text-foreground leading-relaxed">{display(entry.coach_message)}</p>
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
                  {t("daily_content.mental_mission")}
                </p>
                <p className="text-sm text-foreground">{display(entry.mental_mission)}</p>
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
                  {t("daily_content.behavioral_mission")}
                </p>
                <p className="text-sm text-foreground">{display(entry.behavioral_mission)}</p>
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
              {t("daily_content.how_was_today")}
            </p>
            <div className="flex gap-2">
              {checkinOptions.map(opt => {
                const isDisabled = manualCheckInDone && opt.value !== "manageable";
                return (
                  <button
                    key={opt.value}
                    onClick={() => submitCheckin(opt.value)}
                    disabled={savingCheckin || isDisabled}
                    className={`flex-1 py-3 rounded-xl transition-all text-center ${
                      isDisabled ? "bg-muted/50 opacity-50 cursor-not-allowed" : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    <span className="text-lg">{opt.emoji}</span>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t(opt.labelKey)}
                    </p>
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setShowSetbackDialog(true)}
              disabled={savingCheckin}
              className="w-full mt-3 py-2 text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              {t("daily_content.setback_today")}
            </button>
          </CardContent>
        </Card>
      )}

      {/* Already checked in */}
      {entry.checkin_response && entry.checkin_response !== "setback" && (
        <div className="text-center py-2">
          <p className="text-xs text-muted-foreground">
            {t("daily_content.you_checked_in")}{" "}
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
            {t("daily_content.setback_message")}
          </p>
        </div>
      )}

      {/* Setback confirmation dialog */}
      <AlertDialog open={showSetbackDialog} onOpenChange={setShowSetbackDialog}>
        <AlertDialogContent className="rounded-2xl max-w-sm mx-4">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("daily_content.setback_confirm_title")}</AlertDialogTitle>
            <AlertDialogDescription className="text-sm leading-relaxed">
              {t("daily_content.setback_confirm_desc", { remaining: jokersRemaining })}{" "}
              {jokersRemaining <= 1 && (
                <span className="block mt-2 font-medium text-destructive">{t("daily_content.last_joker_warning")}</span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">
              {t("daily_content.go_back")}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                setShowSetbackDialog(false);
                reportFailure();
              }} 
              className="rounded-xl bg-destructive/80 hover:bg-destructive text-destructive-foreground"
            >
              {t("daily_content.yes_setback")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
