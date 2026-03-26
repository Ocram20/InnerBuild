import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { untypedTable } from "@/integrations/supabase/untyped-client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Flame, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import JourneyRoadmap from "@/components/challenge-journey/JourneyRoadmap";
import DailyContentCard from "@/components/challenge-journey/DailyContentCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import BottomNavigation from "@/components/BottomNavigation";
import { useTranslation } from "react-i18next";

interface Challenge {
  id: string;
  title: string;
  description: string | null;
  duration_days: number;
  current_streak: number;
  status: string;
  category: string;
  start_date: string;
  last_check_in: string | null;
  progress_offset: number;
  jokers_remaining: number;
}

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

export default function ChallengeJourney() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<DailyEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingContent, setGeneratingContent] = useState(false);
  const [isExtended, setIsExtended] = useState(false);

  const fetchChallenge = useCallback(async () => {
    if (!user || !id) return;

    const { data, error } = await supabase
      .from("detox_challenges")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error || !data) {
      toast({
        title: t("challenge_journey.challenge_not_found"),
        variant: "destructive",
      });
      navigate("/challenges");
      return;
    }

    setChallenge(data as Challenge);
    return data;
  }, [user, id]);

  const fetchEntries = useCallback(async () => {
    if (!id) return;

    const { data } = await untypedTable("challenge_daily_entries")
      .select("*")
      .eq("challenge_id", id)
      .order("day_number", { ascending: true });

    setEntries((data as DailyEntry[]) || []);
    return data;
  }, [id]);

  // Current day = check-in count + 1 (next day to complete), capped at current_streak if already checked in today
  const computeCurrentDay = useCallback((ch: Challenge) => {
    // Day is strictly based on check-ins completed
    // current_streak = number of successful check-ins = last completed day
    // The "current day" to show/work on is current_streak + 1 (the next day)
    // But if already checked in today, current day = current_streak (show completed day)
    const today = new Date().toISOString().split("T")[0];
    const checkedInToday = ch.last_check_in === today;
    return checkedInToday ? ch.current_streak : ch.current_streak + 1;
  }, []);

  const generateDailyContent = useCallback(async (challengeId: string, dayNumber: number) => {
    setGeneratingContent(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/challenge-daily-content`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ challenge_id: challengeId, day_number: dayNumber }),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to generate content");
      }

      const { entry } = await response.json();
      setSelectedEntry(entry);
      await fetchEntries();
    } catch (error) {
      console.error("Error generating content:", error);
      toast({
        title: t("common.error"),
        description: t("challenge_journey.generate_failed", {
          defaultValue: "Couldn't generate today's content. Please try again in a moment.",
        }),
        variant: "destructive",
      });
    } finally {
      setGeneratingContent(false);
    }
  }, [fetchEntries, toast]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const ch = await fetchChallenge();
      await fetchEntries();

      if (ch) {
        const day = computeCurrentDay(ch as Challenge);
        setSelectedDay(day);
      }
      setLoading(false);
    };
    init();
  }, [fetchChallenge, fetchEntries, computeCurrentDay]);

  // Generate content for current day when selected
  useEffect(() => {
    if (!challenge || selectedDay === null) return;

    const existing = entries.find(e => e.day_number === selectedDay);
    if (existing) {
      setSelectedEntry(existing);
    } else if (selectedDay === computeCurrentDay(challenge) && challenge.status === "active") {
      generateDailyContent(challenge.id, selectedDay);
    } else {
      setSelectedEntry(null);
    }
  }, [selectedDay, challenge, entries]);

  const handleDayClick = (day: number) => {
    setSelectedDay(day);
  };

  const refreshData = async () => {
    await fetchChallenge();
    await fetchEntries();
  };

  const handleResume = async () => {
    if (!challenge) return;
    await supabase
      .from("detox_challenges")
      .update({ status: "active" })
      .eq("id", challenge.id);
    toast({
      title: t("challenge_card.challenge_resumed"),
      description: t("challenge_card.no_jokers_warning"),
    });
    await refreshData();
  };

  const handleReset = async () => {
    if (!challenge) return;
    const today = new Date().toISOString().split("T")[0];
    await supabase
      .from("detox_challenges")
      .update({
        current_streak: 0,
        start_date: today,
        last_check_in: null,
        status: "active",
        jokers_remaining: 3,
        progress_offset: 0,
      })
      .eq("id", challenge.id);
    toast({
      title: t("challenge_card.fresh_start"),
      description: t("challenge_card.fresh_start_desc"),
    });
    await refreshData();
  };

  if (loading) {
    return <LoadingSpinner className="min-h-screen" />;
  }

  if (!challenge) return null;

  // Day based on check-in count, not calendar
  const currentDay = computeCurrentDay(challenge);
  const displayDays = isExtended ? 90 : Math.max(challenge.duration_days, Math.min(currentDay, 90));
  const progressPercent = Math.min((challenge.current_streak / displayDays) * 100, 100);
  const hasReachedOriginalEnd = challenge.current_streak >= challenge.duration_days;
  const originalEndReached = hasReachedOriginalEnd && challenge.duration_days < 90;
  const jokers = challenge.jokers_remaining ?? 3;
  const isPausedByJokers = challenge.status === "paused" && jokers <= 0;

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="flex items-center gap-3 p-4 max-w-lg mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/challenges")}
            className="rounded-full h-9 w-9"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-foreground truncate">{challenge.title}</h1>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Flame className="h-3.5 w-3.5 text-accent" />
              <span>
                {t("challenge_card.day_of", {
                  current: challenge.current_streak,
                  total: challenge.duration_days,
                })}
              </span>
              <span className="text-muted-foreground/50">•</span>
              <span>{Math.round(progressPercent)}%</span>
              <span className="text-muted-foreground/50">•</span>
              {/* Jokers dots */}
              <div className="flex items-center gap-0.5">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${i < jokers ? "bg-accent" : "bg-muted-foreground/20"}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-4 space-y-6">
        {/* Paused by jokers banner */}
        {isPausedByJokers && (
          <div className="glass rounded-2xl p-4 border border-destructive/20 bg-destructive/5 text-center space-y-2 animate-fade-in">
            <div className="flex items-center justify-center gap-2">
              <ShieldAlert className="h-5 w-5 text-destructive" />
              <p className="text-sm font-semibold text-foreground">
                {t("challenge_card.all_jokers_used")}
              </p>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t("challenge_card.paused_at_day", { day: challenge.current_streak })}
            </p>
            <div className="flex gap-2 mt-1">
              <button
                onClick={handleResume}
                className="flex-1 px-4 py-2.5 rounded-xl gradient-accent text-accent-foreground text-sm font-medium transition-all hover:opacity-90"
              >
                {t("challenge_card.resume_detox")}
              </button>
              <button
                onClick={handleReset}
                className="flex-1 px-4 py-2.5 rounded-xl bg-muted text-foreground text-sm font-medium transition-all hover:bg-muted/80"
              >
                {t("challenge_card.reset_detox")}
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground/70 mt-1">
              {t("challenge_card.resume_no_jokers")}
            </p>
          </div>
        )}

        {/* Overall progress bar */}
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground">
              {t("challenge_journey.journey_progress")}
            </p>
            <p className="text-xs font-medium text-foreground">{challenge.current_streak} / {displayDays} days</p>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${progressPercent}%`,
                background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))",
              }}
            />
          </div>
        </div>

        {/* Journey Roadmap */}
        <div className="glass rounded-2xl p-4 overflow-hidden">
          <p className="text-sm font-semibold text-foreground mb-2">
            {t("challenge_journey.your_journey")}
          </p>
          <JourneyRoadmap
            totalDays={challenge.duration_days}
            currentDay={currentDay}
            progressOffset={0}
            entries={entries}
            onDayClick={handleDayClick}
            isExtended={isExtended}
          />

          {/* Continuation CTA when user reaches original challenge end */}
          {originalEndReached && !isExtended && (
            <div className="mt-4 p-4 rounded-xl bg-accent/5 border border-accent/20 text-center space-y-2">
              <p className="text-sm font-semibold text-foreground">
                {t("challenge_journey.goal_reached")}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t("challenge_journey.continue_90", { days: challenge.duration_days })}
              </p>
              <button
                onClick={() => setIsExtended(true)}
                className="mt-2 px-5 py-2.5 rounded-xl bg-accent text-accent-foreground text-sm font-medium transition-all hover:opacity-90"
              >
                {t("challenge_journey.continue_to_90")}
              </button>
            </div>
          )}
        </div>

        {/* Daily Content */}
        <div>
          <p className="text-sm font-semibold text-foreground mb-3">
            {selectedDay === currentDay
              ? t("challenge_journey.today")
              : t("challenge_journey.day_n", { n: selectedDay ?? 0 })}
          </p>
          <DailyContentCard
            entry={selectedEntry}
            isLoading={generatingContent}
            isCurrentDay={selectedDay === currentDay && challenge.status === "active"}
            challengeId={challenge.id}
            jokersRemaining={jokers}
            onUpdate={refreshData}
          />
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}
