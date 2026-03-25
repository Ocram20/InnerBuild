import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { enUS, it } from "date-fns/locale";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { 
  Loader2, 
  Flame, 
  Heart, 
  Moon,
  ListTodo,
  Ban,
  Check,
  Sparkles,
  Battery,
  Shield
} from "lucide-react";

// Small checkmark icon component
const SmallCheck = () => (
  <svg className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// Small X icon component
const SmallX = () => (
  <svg className="h-3.5 w-3.5 text-red-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

interface DayDetailModalProps {
  date: Date;
  open: boolean;
  onClose: () => void;
}

interface HabitLog {
  id: string;
  title: string;
  completed: boolean;
}

interface DayData {
  habits: HabitLog[];
  dailyReflection: { day_summary?: string; grateful_for?: string[]; lessons_learned?: string } | null;
  detoxChallenges: { title: string; current_streak: number; status: string; last_check_in: string | null }[];
  recoveryCheckIn: { status: string; notes?: string } | null;
  tasks: { title: string; is_completed: boolean }[];
  notToDo: { title: string; status: string }[];
  dailyCheckIn: { mood: string; energy_level: number } | null;
  challengeEntries: { challenge_title: string; checkin_response: string | null; is_failure: boolean; mental_mission_completed: boolean; behavioral_mission_completed: boolean }[];
}

export function DayDetailModal({ date, open, onClose }: DayDetailModalProps) {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === "it" ? it : enUS;
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dayData, setDayData] = useState<DayData | null>(null);

  const dateStr = format(date, "yyyy-MM-dd");

  useEffect(() => {
    if (open && user) {
      fetchDayData();
    }
  }, [open, user, dateStr]);

  const fetchDayData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [
        habitsRes,
        habitLogsRes,
        dailyReflectionsRes,
        challengesRes,
        checkInsRes,
        tasksRes,
        notToDoRes,
        dailyCheckInRes,
        challengeEntriesRes,
      ] = await Promise.all([
        supabase.from("habits").select("id, title").eq("user_id", user.id).eq("is_active", true),
        supabase.from("habit_logs").select("habit_id").eq("user_id", user.id).eq("completed_at", dateStr),
        supabase.from("daily_reflections").select("day_summary, grateful_for, lessons_learned").eq("user_id", user.id).eq("reflection_date", dateStr).maybeSingle(),
        supabase.from("detox_challenges").select("id, title, current_streak, status, last_check_in").eq("user_id", user.id),
        supabase.from("recovery_checkins").select("status, notes").eq("user_id", user.id).eq("checkin_date", dateStr).maybeSingle(),
        supabase.from("daily_tasks").select("title, is_completed").eq("user_id", user.id).eq("target_date", dateStr),
        supabase.from("not_to_do_items").select("title, status").eq("user_id", user.id).eq("target_date", dateStr),
        supabase.from("daily_checkins").select("mood, energy_level").eq("user_id", user.id).eq("checkin_date", dateStr).maybeSingle(),
        supabase.from("challenge_daily_entries").select("challenge_id, created_at, checkin_response, is_failure, mental_mission_completed, behavioral_mission_completed").eq("user_id", user.id),
      ]);

      const completedHabitIds = new Set(habitLogsRes.data?.map(log => log.habit_id) || []);
      
      const habits: HabitLog[] = (habitsRes.data || []).map(habit => ({
        id: habit.id,
        title: habit.title,
        completed: completedHabitIds.has(habit.id),
      }));

      // Build challenge title map
      const challengeTitleMap = new Map<string, string>();
      (challengesRes.data || []).forEach(c => challengeTitleMap.set(c.id, c.title));
      
      // Filter challenge entries created on this date
      const challengeEntries = (challengeEntriesRes.data || [])
        .filter(e => format(new Date(e.created_at), "yyyy-MM-dd") === dateStr)
        .map(e => ({
          challenge_title: challengeTitleMap.get(e.challenge_id) || "Challenge",
          checkin_response: e.checkin_response,
          is_failure: e.is_failure || false,
          mental_mission_completed: e.mental_mission_completed || false,
          behavioral_mission_completed: e.behavioral_mission_completed || false,
        }));

      setDayData({
        habits,
        dailyReflection: dailyReflectionsRes.data,
        detoxChallenges: challengesRes.data || [],
        recoveryCheckIn: checkInsRes.data,
        tasks: tasksRes.data || [],
        notToDo: notToDoRes.data || [],
        dailyCheckIn: dailyCheckInRes.data,
        challengeEntries,
      });
    } catch (error) {
      console.error("Error fetching day data:", error);
    } finally {
      setLoading(false);
    }
  };

  const completedHabits = dayData?.habits.filter(h => h.completed) || [];
  const notCompletedHabits = dayData?.habits.filter(h => !h.completed) || [];
  const completedTasks = dayData?.tasks.filter(t => t.is_completed) || [];
  const notCompletedTasks = dayData?.tasks.filter(t => !t.is_completed) || [];

  // Check if there's any data to show sections
  const hasHabits = dayData?.habits && dayData.habits.length > 0;
  const hasTasks = dayData?.tasks && dayData.tasks.length > 0;
  const hasNotToDo = dayData?.notToDo && dayData.notToDo.length > 0;
  const hasChallenges = dayData?.detoxChallenges && dayData.detoxChallenges.length > 0;
  const hasDailyReflection = dayData?.dailyReflection && (
    dayData.dailyReflection.day_summary || 
    (dayData.dailyReflection.grateful_for && dayData.dailyReflection.grateful_for.length > 0) || 
    dayData.dailyReflection.lessons_learned
  );
  const hasRecoveryCheckIn = dayData?.recoveryCheckIn;
  const hasDailyCheckIn = dayData?.dailyCheckIn;
  const hasChallengeEntries = dayData?.challengeEntries && dayData.challengeEntries.length > 0;

  const moodLabels: Record<string, { label: string; emoji: string }> = {
    great: { label: t("day_detail_modal.mood.great", "Great"), emoji: "😊" },
    good: { label: t("day_detail_modal.mood.good", "Good"), emoji: "🙂" },
    okay: { label: t("day_detail_modal.mood.okay", "Okay"), emoji: "😐" },
    struggling: { label: t("day_detail_modal.mood.struggling", "Struggling"), emoji: "😔" },
    difficult: { label: t("day_detail_modal.mood.difficult", "Difficult"), emoji: "😣" },
  };

  // Section component for consistent styling
  const Section = ({ 
    icon: Icon, 
    title, 
    iconColor, 
    children 
  }: { 
    icon: React.ElementType; 
    title: string; 
    iconColor: string;
    children: React.ReactNode;
  }) => (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${iconColor}`} />
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      </div>
      <div className="pl-6">
        {children}
      </div>
    </section>
  );

  // Empty state message
  const NotRecorded = ({ message }: { message: string }) => (
    <p className="text-sm text-muted-foreground italic">{message}</p>
  );

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-border/50 flex-shrink-0">
          <DialogTitle className="text-lg font-semibold">
            {format(date, "EEEE, MMMM d, yyyy", { locale: dateLocale })}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              
              {/* DAILY CHECK-IN SECTION */}
              <Section icon={Sparkles} title={t("day_detail_modal.daily_checkin")} iconColor="text-rose-500">
                {hasDailyCheckIn ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{moodLabels[dayData?.dailyCheckIn?.mood || ""]?.emoji}</span>
                      <span className="text-sm text-foreground">
                        {t("day_detail_modal.mood_label")}: {moodLabels[dayData?.dailyCheckIn?.mood || ""]?.label || dayData?.dailyCheckIn?.mood}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Battery className="h-4 w-4 text-amber-500" />
                      <span className="text-sm text-foreground">
                        {t("day_detail_modal.energy_label")}: {dayData?.dailyCheckIn?.energy_level}/10
                      </span>
                    </div>
                  </div>
                ) : (
                  <NotRecorded message={t("day_detail_modal.no_daily_checkin", "No daily check-in recorded")} />
                )}
              </Section>

              <Separator className="bg-border/50" />
              
              {/* HABITS SECTION */}
              <Section icon={Check} title={t("day_detail_modal.habits")} iconColor="text-emerald-500">
                {hasHabits ? (
                  <div className="space-y-3">
                    {completedHabits.length > 0 && (
                      <div className="space-y-1.5">
                        {completedHabits.map(habit => (
                          <div key={habit.id} className="flex items-center gap-2">
                            <SmallCheck />
                            <span className="text-sm text-foreground">{habit.title}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {notCompletedHabits.length > 0 && (
                      <div className="space-y-1.5">
                        {notCompletedHabits.map(habit => (
                          <div key={habit.id} className="flex items-center gap-2">
                            <SmallX />
                            <span className="text-sm text-muted-foreground">{habit.title}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <NotRecorded message={t("day_detail_modal.no_habits")} />
                )}
              </Section>

              <Separator className="bg-border/50" />

              {/* DAILY TASKS SECTION */}
              <Section icon={ListTodo} title={t("day_detail_modal.daily_tasks")} iconColor="text-blue-500">
                {hasTasks ? (
                  <div className="space-y-3">
                    {completedTasks.length > 0 && (
                      <div className="space-y-1.5">
                        {completedTasks.map((task, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <SmallCheck />
                            <span className="text-sm text-foreground">{task.title}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {notCompletedTasks.length > 0 && (
                      <div className="space-y-1.5">
                        {notCompletedTasks.map((task, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <SmallX />
                            <span className="text-sm text-muted-foreground">{task.title}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <NotRecorded message={t("day_detail_modal.no_tasks")} />
                )}
              </Section>

              <Separator className="bg-border/50" />

              {/* NOT-TO-DO SECTION */}
              <Section icon={Ban} title={t("day_detail_modal.things_to_avoid")} iconColor="text-orange-500">
                {hasNotToDo ? (
                  <div className="space-y-1.5">
                    {dayData?.notToDo.map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        {item.status === "avoided" ? (
                          <SmallCheck />
                        ) : (
                          <SmallX />
                        )}
                        <span className={`text-sm ${
                          item.status === "avoided" 
                            ? "text-foreground" 
                            : "text-muted-foreground"
                        }`}>
                          {item.title}
                          {item.status === "avoided" && ` — ${t("day_detail_modal.avoided")}`}
                          {item.status === "failed" && ` — ${t("day_detail_modal.not_avoided")}`}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <NotRecorded message={t("day_detail_modal.no_not_to_do", "No avoidance goals set for this day")} />
                )}
              </Section>

              <Separator className="bg-border/50" />

              {/* DETOX CHALLENGES SECTION */}
              <Section icon={Flame} title={t("day_detail_modal.detox_challenges")} iconColor="text-amber-500">
                {hasChallenges ? (
                  <div className="space-y-3">
                    {dayData?.detoxChallenges
                      .filter(c => c.status === "active")
                      .map((challenge, i) => {
                        const wasCheckedThisDay = challenge.last_check_in === dateStr;
                        return (
                          <div key={i} className="space-y-1">
                            <div className="flex items-center gap-2">
                              {wasCheckedThisDay ? <SmallCheck /> : <SmallX />}
                              <span className={`text-sm ${wasCheckedThisDay ? "text-foreground" : "text-muted-foreground"}`}>
                                {challenge.title}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground ml-5">
                              {wasCheckedThisDay 
                                ? t("day_detail_modal.streak_continued", { day: challenge.current_streak })
                                : t("day_detail_modal.no_checkin_recorded")}
                            </p>
                          </div>
                        );
                      })}
                    {dayData?.detoxChallenges.filter(c => c.status === "active").length === 0 && (
                      <NotRecorded message={t("day_detail_modal.no_challenges", "No active challenges this day")} />
                    )}
                  </div>
                ) : (
                  <NotRecorded message={t("day_detail_modal.no_challenges")} />
                )}

                {/* Recovery check-in */}
                {hasRecoveryCheckIn && (
                  <div className="mt-4 pt-3 border-t border-border/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className={`h-3.5 w-3.5 ${
                        dayData?.recoveryCheckIn?.status === "success" ? "text-emerald-500" : "text-red-500"
                      }`} />
                      <span className={`text-sm ${
                        dayData?.recoveryCheckIn?.status === "success" ? "text-emerald-600" : "text-red-500/80"
                      }`}>
                        {dayData?.recoveryCheckIn?.status === "success" ? t("day_detail_modal.clean_day") : t("day_detail_modal.relapse_occurred")}
                      </span>
                    </div>
                    {dayData?.recoveryCheckIn?.notes && (
                      <p className="text-sm text-muted-foreground ml-5 italic">
                        "{dayData.recoveryCheckIn.notes}"
                      </p>
                    )}
                  </div>
                )}
              </Section>

              <Separator className="bg-border/50" />

              {/* CHALLENGE JOURNEY ENTRIES */}
              <Section icon={Shield} title={t("day_detail_modal.challenge_journey")} iconColor="text-purple-500">
                {hasChallengeEntries ? (
                  <div className="space-y-3">
                    {dayData?.challengeEntries.map((entry, i) => (
                      <div key={i} className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          {entry.is_failure ? <SmallX /> : <SmallCheck />}
                          <span className={`text-sm ${entry.is_failure ? "text-muted-foreground" : "text-foreground"}`}>
                            {entry.is_failure ? t("day_detail_modal.setback") : (entry.checkin_response || t("day_detail_modal.checked_in"))}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 ml-5">
                          <span className="text-xs text-muted-foreground">
                            🧠 {entry.mental_mission_completed ? "✓" : "✗"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            💪 {entry.behavioral_mission_completed ? "✓" : "✗"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <NotRecorded message={t("day_detail_modal.no_challenge_activity", "No challenge journey activity this day")} />
                )}
              </Section>

              <Separator className="bg-border/50" />

              {/* EVENING REFLECTION */}
              <Section icon={Moon} title={t("day_detail_modal.evening_reflection")} iconColor="text-indigo-500">
                {hasDailyReflection ? (
                  <div className="space-y-4">
                    {dayData?.dailyReflection?.day_summary && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">{t("day_detail_modal.how_was_your_day")}</p>
                        <p className="text-sm text-foreground leading-relaxed">
                          {dayData.dailyReflection.day_summary}
                        </p>
                      </div>
                    )}
                    
                    {dayData?.dailyReflection?.grateful_for && dayData.dailyReflection.grateful_for.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">{t("day_detail_modal.grateful_for")}</p>
                        <ul className="space-y-1">
                          {dayData.dailyReflection.grateful_for.map((item, i) => (
                            <li key={i} className="text-sm text-foreground">• {item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {dayData?.dailyReflection?.lessons_learned && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">{t("day_detail_modal.lessons_learned")}</p>
                        <p className="text-sm text-foreground leading-relaxed">
                          {dayData.dailyReflection.lessons_learned}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <NotRecorded message={t("day_detail_modal.no_evening_reflection", "No evening reflection written this day")} />
                )}
              </Section>

            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
