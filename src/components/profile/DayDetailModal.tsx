import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { untypedTable } from "@/integrations/supabase/untyped-client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
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
  Shield,
  Plus,
  X,
  Save,
  Trash2,
  Zap,
  Coffee,
  Book,
  Smile,
  Target,
  Lightbulb,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { dateFnsLocale } from "@/lib/dateFnsLocale";
import { useUiBatchTranslation } from "@/hooks/useUiBatchTranslation";
import { detoxChallengeAppliesOnDateStr, habitWasTrackedOnDate } from "@/lib/historicalActivity";

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
  onUpdated?: () => void;
}

interface HabitLog {
  id: string;
  title: string;
  completed: boolean;
  original_language?: string;
}

interface TaskItem {
  id: string;
  title: string;
  is_completed: boolean;
  original_language?: string;
}

interface NotToDoEntry {
  id: string;
  title: string;
  status: string;
  log_id?: string | null;
  original_language?: string;
}

interface DayData {
  habits: HabitLog[];
  dailyReflection: {
    id?: string;
    day_summary?: string;
    grateful_for?: string[];
    lessons_learned?: string;
    original_language?: string;
  } | null;
  detoxChallenges: {
    id: string;
    title: string;
    current_streak: number;
    status: string;
    last_check_in: string | null;
    start_date: string;
    duration_days: number;
  }[];
  recoveryJourneyId: string | null;
  recoveryCheckIn: { id?: string; status: string; notes?: string; original_language?: string } | null;
  tasks: TaskItem[];
  notToDo: NotToDoEntry[];
  dailyCheckIn: { mood: string; energy_level: number; original_language?: string } | null;
  challengeEntries: {
    challenge_title: string;
    checkin_response: string | null;
    is_failure: boolean;
    mental_mission_completed: boolean;
    behavioral_mission_completed: boolean;
    original_language?: string;
  }[];
}

const MOOD_OPTIONS = [
  { value: "great", emoji: "😊", color: "bg-green-500/20 text-green-600 border-green-500/40" },
  { value: "good", emoji: "🙂", color: "bg-emerald-500/20 text-emerald-600 border-emerald-500/40" },
  { value: "okay", emoji: "😐", color: "bg-yellow-500/20 text-yellow-600 border-yellow-500/40" },
  { value: "struggling", emoji: "😔", color: "bg-orange-500/20 text-orange-600 border-orange-500/40" },
  { value: "difficult", emoji: "😣", color: "bg-red-500/20 text-red-600 border-red-500/40" },
];

const DAY_SUMMARY_OPTIONS = [
  { value: "productive", label: "Produttivo", icon: Zap, color: "bg-blue-500/20 text-blue-600 border-blue-500/40" },
  { value: "relaxing", label: "Rilassante", icon: Coffee, color: "bg-green-500/20 text-green-600 border-green-500/40" },
  { value: "challenging", label: "Sfida", icon: Target, color: "bg-orange-500/20 text-orange-600 border-orange-500/40" },
  { value: "learning", label: "Imparativo", icon: Book, color: "bg-purple-500/20 text-purple-600 border-purple-500/40" },
  { value: "social", label: "Sociale", icon: Smile, color: "bg-pink-500/20 text-pink-600 border-pink-500/40" },
  { value: "mixed", label: "Misto", icon: Moon, color: "bg-gray-500/20 text-gray-600 border-gray-500/40" },
];

const LESSONS_OPTIONS = [
  { value: "patience", label: "Pazienza", icon: Moon, color: "bg-indigo-500/20 text-indigo-600 border-indigo-500/40" },
  { value: "focus", label: "Focus", icon: Target, color: "bg-blue-500/20 text-blue-600 border-blue-500/40" },
  { value: "self_care", label: "Self-care", icon: Heart, color: "bg-pink-500/20 text-pink-600 border-pink-500/40" },
  { value: "gratitude", label: "Gratitudine", icon: Lightbulb, color: "bg-yellow-500/20 text-yellow-600 border-yellow-500/40" },
  { value: "resilience", label: "Resilienza", icon: Zap, color: "bg-orange-500/20 text-orange-600 border-orange-500/40" },
  { value: "balance", label: "Equilibrio", icon: Coffee, color: "bg-green-500/20 text-green-600 border-green-500/40" },
];

function parseTagArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.map(String) : [value];
    } catch {
      return [value];
    }
  }
  return [];
}

export function DayDetailModal({ date, open, onClose, onUpdated }: DayDetailModalProps) {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const dateLocale = dateFnsLocale(i18n.resolvedLanguage || i18n.language);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dayData, setDayData] = useState<DayData | null>(null);

  // Interactive states for editing
  const [mood, setMood] = useState<string | null>(null);
  const [energyLevel, setEnergyLevel] = useState<number[]>([5]);
  const [checkInDirty, setCheckInDirty] = useState(false);
  const [savingCheckIn, setSavingCheckIn] = useState(false);

  const [togglingHabitId, setTogglingHabitId] = useState<string | null>(null);
  const [togglingTaskId, setTogglingTaskId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [addingTask, setAddingTask] = useState(false);

  const [updatingNotToDoId, setUpdatingNotToDoId] = useState<string | null>(null);
  const [newNotToDoTitle, setNewNotToDoTitle] = useState("");
  const [addingNotToDo, setAddingNotToDo] = useState(false);

  const [updatingRecovery, setUpdatingRecovery] = useState(false);

  // Evening reflection interactive state
  const [reflectionId, setReflectionId] = useState<string | undefined>(undefined);
  const [daySummaryTags, setDaySummaryTags] = useState<string[]>([]);
  const [gratefulFor, setGratefulFor] = useState<string[]>([]);
  const [newGratitude, setNewGratitude] = useState("");
  const [lessonsTags, setLessonsTags] = useState<string[]>([]);
  const [reflectionDirty, setReflectionDirty] = useState(false);
  const [savingReflection, setSavingReflection] = useState(false);

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
        journeyRes,
        tasksRes,
        notToDoItemsRes,
        dailyCheckInRes,
        challengeEntriesRes,
        notToDoLogsRes,
      ] = await Promise.all([
        supabase.from("habits").select("id, title, created_at, is_active, updated_at, original_language").eq("user_id", user.id),
        supabase.from("habit_logs").select("habit_id").eq("user_id", user.id).eq("completed_at", dateStr),
        supabase.from("daily_reflections").select("id, day_summary, grateful_for, lessons_learned, original_language").eq("user_id", user.id).eq("reflection_date", dateStr).maybeSingle(),
        supabase.from("detox_challenges").select("id, title, current_streak, status, last_check_in, start_date, duration_days").eq("user_id", user.id),
        supabase.from("recovery_checkins").select("id, status, notes, original_language").eq("user_id", user.id).eq("checkin_date", dateStr).maybeSingle(),
        supabase.from("recovery_journey").select("id").eq("user_id", user.id).eq("is_active", true).maybeSingle(),
        supabase.from("daily_tasks").select("id, title, is_completed, original_language").eq("user_id", user.id).eq("target_date", dateStr).order("created_at", { ascending: true }),
        untypedTable("not_to_do_items").select("id, title, created_at, original_language").eq("user_id", user.id).eq("is_active", true).order("created_at", { ascending: true }),
        untypedTable("daily_checkins").select("mood, energy_level, original_language").eq("user_id", user.id).eq("checkin_date", dateStr).maybeSingle(),
        untypedTable("challenge_daily_entries").select("challenge_id, created_at, checkin_response, is_failure, mental_mission_completed, behavioral_mission_completed, original_language").eq("user_id", user.id),
        untypedTable("not_to_do_logs").select("id, not_to_do_id, status").eq("user_id", user.id).eq("log_date", dateStr),
      ]);

      const completedHabitIds = new Set(habitLogsRes.data?.map(log => log.habit_id) || []);

      const habitsRaw = habitsRes.data || [];
      // Include habits that were tracked on that date OR are currently active so the user can always log them
      const habits: HabitLog[] = habitsRaw
        .filter((habit) => habit.is_active || completedHabitIds.has(habit.id) || habitWasTrackedOnDate(habit, date))
        .map((habit) => ({
          id: habit.id,
          title: habit.title,
          completed: completedHabitIds.has(habit.id),
          original_language: habit.original_language,
        }));

      const challengesAll = challengesRes.data || [];
      const detoxChallenges = challengesAll.filter((c) => detoxChallengeAppliesOnDateStr(c, dateStr));

      const challengeTitleMap = new Map<string, string>();
      challengesAll.forEach((c) => challengeTitleMap.set(c.id, c.title));
      
      const challengeEntries = (challengeEntriesRes.data || [])
        .filter((e: any) => format(new Date(e.created_at), "yyyy-MM-dd") === dateStr)
        .map((e: any) => ({
          challenge_title:
            challengeTitleMap.get(e.challenge_id) || t("day_detail_modal.challenge_default_title"),
          checkin_response: e.checkin_response,
          is_failure: e.is_failure || false,
          mental_mission_completed: e.mental_mission_completed || false,
          behavioral_mission_completed: e.behavioral_mission_completed || false,
          original_language: e.original_language,
        }));

      const activeNotToDoItems = notToDoItemsRes.data || [];
      const notToDoLogs = notToDoLogsRes.data || [];
      const notToDo: NotToDoEntry[] = activeNotToDoItems.map((item: any) => {
        const log = notToDoLogs.find((l: any) => l.not_to_do_id === item.id);
        return {
          id: item.id,
          title: item.title,
          status: log ? log.status : "pending",
          log_id: log ? log.id : null,
          original_language: item.original_language,
        };
      });

      // Initialize Daily Check-in state
      if (dailyCheckInRes.data) {
        setMood(dailyCheckInRes.data.mood);
        setEnergyLevel([dailyCheckInRes.data.energy_level ?? 5]);
      } else {
        setMood(null);
        setEnergyLevel([5]);
      }
      setCheckInDirty(false);

      // Initialize Evening Reflection state
      const refl = dailyReflectionsRes.data;
      if (refl) {
        setReflectionId(refl.id);
        setDaySummaryTags(parseTagArray(refl.day_summary));
        setGratefulFor(refl.grateful_for || []);
        setLessonsTags(parseTagArray(refl.lessons_learned));
      } else {
        setReflectionId(undefined);
        setDaySummaryTags([]);
        setGratefulFor([]);
        setLessonsTags([]);
      }
      setNewGratitude("");
      setReflectionDirty(false);

      setDayData({
        habits,
        dailyReflection: refl,
        detoxChallenges,
        recoveryJourneyId: journeyRes.data?.id || null,
        recoveryCheckIn: checkInsRes.data,
        tasks: (tasksRes.data || []) as TaskItem[],
        notToDo,
        dailyCheckIn: dailyCheckInRes.data,
        challengeEntries,
      });
    } catch (error) {
      console.error("Error fetching day data:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers for editing ---

  const handleSaveDailyCheckIn = async (selectedMood?: string, selectedEnergy?: number) => {
    if (!user) return;
    const moodToSave = selectedMood ?? mood;
    const energyToSave = selectedEnergy ?? energyLevel[0];
    if (!moodToSave) {
      toast({
        title: t("evening_reflection.select_mood", "Seleziona il tuo umore"),
        description: t("evening_reflection.select_mood_desc", "Seleziona come ti sei sentito."),
        variant: "destructive",
      });
      return;
    }

    setSavingCheckIn(true);
    try {
      const { error } = await untypedTable("daily_checkins").upsert(
        {
          user_id: user.id,
          checkin_date: dateStr,
          mood: moodToSave,
          energy_level: energyToSave,
        },
        { onConflict: "user_id,checkin_date" }
      );
      if (error) throw error;
      setCheckInDirty(false);
      setDayData(prev => prev ? { ...prev, dailyCheckIn: { mood: moodToSave, energy_level: energyToSave } } : prev);
      onUpdated?.();
      toast({
        title: t("evening_reflection.checkin_complete", "Check-in salvato!"),
        description: t("evening_reflection.checkin_saved", "Il tuo check-in giornaliero è stato aggiornato."),
      });
    } catch (err) {
      console.error("Error saving daily check-in:", err);
      toast({
        title: t("common.error", "Errore"),
        description: t("evening_reflection.failed_checkin", "Impossibile salvare il check-in."),
        variant: "destructive",
      });
    } finally {
      setSavingCheckIn(false);
    }
  };

  const handleToggleHabit = async (habit: HabitLog) => {
    if (!user || togglingHabitId) return;
    setTogglingHabitId(habit.id);
    const nextCompleted = !habit.completed;

    // Optimistic update
    setDayData(prev =>
      prev
        ? {
            ...prev,
            habits: prev.habits.map(h => (h.id === habit.id ? { ...h, completed: nextCompleted } : h)),
          }
        : prev
    );

    try {
      if (nextCompleted) {
        const { error } = await supabase.from("habit_logs").insert({
          habit_id: habit.id,
          user_id: user.id,
          completed_at: dateStr,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("habit_logs")
          .delete()
          .eq("habit_id", habit.id)
          .eq("user_id", user.id)
          .eq("completed_at", dateStr);
        if (error) throw error;
      }
      onUpdated?.();
    } catch (err) {
      console.error("Error toggling habit on past date:", err);
      // Revert optimistic update
      setDayData(prev =>
        prev
          ? {
              ...prev,
              habits: prev.habits.map(h => (h.id === habit.id ? { ...h, completed: habit.completed } : h)),
            }
          : prev
      );
      toast({
        title: t("common.error", "Errore"),
        description: t("dashboard.failed_update_habit", "Aggiornamento abitudine fallito"),
        variant: "destructive",
      });
    } finally {
      setTogglingHabitId(null);
    }
  };

  const handleToggleTask = async (task: TaskItem) => {
    if (!user || togglingTaskId) return;
    setTogglingTaskId(task.id);
    const nextCompleted = !task.is_completed;

    setDayData(prev =>
      prev
        ? {
            ...prev,
            tasks: prev.tasks.map(tk => (tk.id === task.id ? { ...tk, is_completed: nextCompleted } : tk)),
          }
        : prev
    );

    try {
      const { error } = await supabase
        .from("daily_tasks")
        .update({
          is_completed: nextCompleted,
          completed_at: nextCompleted ? new Date().toISOString() : null,
        })
        .eq("id", task.id);
      if (error) throw error;
      onUpdated?.();
    } catch (err) {
      console.error("Error toggling task:", err);
      setDayData(prev =>
        prev
          ? {
              ...prev,
              tasks: prev.tasks.map(tk => (tk.id === task.id ? { ...tk, is_completed: task.is_completed } : tk)),
            }
          : prev
      );
      toast({
        title: t("common.error", "Errore"),
        description: t("todo_section.error_update", "Impossibile aggiornare il task"),
        variant: "destructive",
      });
    } finally {
      setTogglingTaskId(null);
    }
  };

  const handleAddTask = async () => {
    if (!user || !newTaskTitle.trim() || addingTask) return;
    setAddingTask(true);
    try {
      const { data, error } = await supabase
        .from("daily_tasks")
        .insert({
          user_id: user.id,
          title: newTaskTitle.trim(),
          description: "__priority:standard",
          target_date: dateStr,
          is_completed: true,
          completed_at: new Date().toISOString(),
          original_language: i18n.resolvedLanguage || i18n.language || "it",
        })
        .select("id, title, is_completed, original_language")
        .single();

      if (error) throw error;
      if (data) {
        setDayData(prev => (prev ? { ...prev, tasks: [...prev.tasks, data as TaskItem] } : prev));
        setNewTaskTitle("");
        onUpdated?.();
      }
    } catch (err) {
      console.error("Error adding task:", err);
      toast({
        title: t("common.error", "Errore"),
        description: t("todo_section.error_add", "Impossibile aggiungere il task"),
        variant: "destructive",
      });
    } finally {
      setAddingTask(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!user) return;
    try {
      const { error } = await supabase.from("daily_tasks").delete().eq("id", taskId);
      if (error) throw error;
      setDayData(prev => (prev ? { ...prev, tasks: prev.tasks.filter(tk => tk.id !== taskId) } : prev));
      onUpdated?.();
    } catch (err) {
      console.error("Error deleting task:", err);
      toast({
        title: t("common.error", "Errore"),
        description: t("todo_section.error_delete", "Impossibile eliminare il task"),
        variant: "destructive",
      });
    }
  };

  const handleUpdateNotToDo = async (item: NotToDoEntry, newStatus: "avoided" | "broken") => {
    if (!user || updatingNotToDoId) return;
    setUpdatingNotToDoId(item.id);
    try {
      let newLogId = item.log_id;
      if (item.log_id) {
        const { data, error } = await untypedTable("not_to_do_logs")
          .update({ status: newStatus })
          .eq("id", item.log_id)
          .select("id")
          .single();
        if (error) throw error;
        if (data) newLogId = data.id;
      } else {
        const { data: existingLog } = await untypedTable("not_to_do_logs")
          .select("id")
          .eq("user_id", user.id)
          .eq("not_to_do_id", item.id)
          .eq("log_date", dateStr)
          .maybeSingle();

        if (existingLog) {
          const { data, error } = await untypedTable("not_to_do_logs")
            .update({ status: newStatus })
            .eq("id", existingLog.id)
            .select("id")
            .single();
          if (error) throw error;
          if (data) newLogId = data.id;
        } else {
          const { data, error } = await untypedTable("not_to_do_logs")
            .insert({
              not_to_do_id: item.id,
              user_id: user.id,
              log_date: dateStr,
              status: newStatus,
            })
            .select("id")
            .single();
          if (error) throw error;
          if (data) newLogId = data.id;
        }
      }

      setDayData(prev =>
        prev
          ? {
              ...prev,
              notToDo: prev.notToDo.map(n =>
                n.id === item.id ? { ...n, status: newStatus, log_id: newLogId } : n
              ),
            }
          : prev
      );
      onUpdated?.();
    } catch (err) {
      console.error("Error updating not-to-do status:", err);
      toast({
        title: t("common.error", "Errore"),
        description: t("not_to_do_section.error_update", "Impossibile aggiornare lo stato"),
        variant: "destructive",
      });
    } finally {
      setUpdatingNotToDoId(null);
    }
  };

  const handleAddNotToDoItem = async () => {
    if (!user || !newNotToDoTitle.trim() || addingNotToDo) return;
    setAddingNotToDo(true);
    try {
      const { data: itemData, error: itemError } = await untypedTable("not_to_do_items")
        .insert({
          user_id: user.id,
          title: newNotToDoTitle.trim(),
          is_active: true,
          original_language: i18n.resolvedLanguage || i18n.language || "it",
        })
        .select("id, title, original_language")
        .single();

      if (itemError) throw itemError;

      const { data: logData, error: logError } = await untypedTable("not_to_do_logs")
        .insert({
          not_to_do_id: itemData.id,
          user_id: user.id,
          log_date: dateStr,
          status: "avoided",
        })
        .select("id")
        .single();

      if (logError) throw logError;

      setDayData(prev =>
        prev
          ? {
              ...prev,
              notToDo: [
                ...prev.notToDo,
                {
                  id: itemData.id,
                  title: itemData.title,
                  status: "avoided",
                  log_id: logData?.id || null,
                  original_language: itemData.original_language,
                },
              ],
            }
          : prev
      );
      setNewNotToDoTitle("");
      onUpdated?.();
    } catch (err) {
      console.error("Error adding not-to-do item:", err);
      toast({
        title: t("common.error", "Errore"),
        description: t("not_to_do_section.error_add", "Impossibile aggiungere l'elemento"),
        variant: "destructive",
      });
    } finally {
      setAddingNotToDo(false);
    }
  };

  const handleRecoveryStatus = async (status: "success" | "failed") => {
    if (!user || updatingRecovery) return;
    const journeyId = dayData?.recoveryJourneyId;
    if (!journeyId && !dayData?.recoveryCheckIn?.id) return;

    setUpdatingRecovery(true);
    try {
      if (dayData?.recoveryCheckIn?.id) {
        const { error } = await supabase
          .from("recovery_checkins")
          .update({ status })
          .eq("id", dayData.recoveryCheckIn.id);
        if (error) throw error;
        setDayData(prev =>
          prev && prev.recoveryCheckIn
            ? { ...prev, recoveryCheckIn: { ...prev.recoveryCheckIn, status } }
            : prev
        );
      } else if (journeyId) {
        const { data, error } = await supabase
          .from("recovery_checkins")
          .insert({
            user_id: user.id,
            journey_id: journeyId,
            status,
            checkin_date: dateStr,
          })
          .select("id, status, notes, original_language")
          .single();
        if (error) throw error;
        setDayData(prev => (prev ? { ...prev, recoveryCheckIn: data } : prev));
      }
      onUpdated?.();
    } catch (err) {
      console.error("Error updating recovery check-in:", err);
      toast({
        title: t("common.error", "Errore"),
        description: t("recovery.toast_checkin_failed_desc", "Impossibile registrare il check-in."),
        variant: "destructive",
      });
    } finally {
      setUpdatingRecovery(false);
    }
  };

  const toggleReflectionTag = (field: "day_summary" | "lessons_learned", value: string) => {
    if (field === "day_summary") {
      setDaySummaryTags(prev =>
        prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
      );
    } else {
      setLessonsTags(prev =>
        prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
      );
    }
    setReflectionDirty(true);
  };

  const handleAddGratitude = () => {
    if (!newGratitude.trim() || gratefulFor.length >= 3) return;
    setGratefulFor(prev => [...prev, newGratitude.trim()]);
    setNewGratitude("");
    setReflectionDirty(true);
  };

  const handleRemoveGratitude = (idx: number) => {
    setGratefulFor(prev => prev.filter((_, i) => i !== idx));
    setReflectionDirty(true);
  };

  const handleSaveReflection = async () => {
    if (!user) return;
    setSavingReflection(true);

    const payload = {
      user_id: user.id,
      reflection_date: dateStr,
      day_summary: JSON.stringify(daySummaryTags),
      grateful_for: gratefulFor,
      lessons_learned: JSON.stringify(lessonsTags),
      original_language:
        dayData?.dailyReflection?.original_language ||
        i18n.resolvedLanguage ||
        i18n.language ||
        "it",
    };

    try {
      if (reflectionId) {
        const { error } = await supabase
          .from("daily_reflections")
          .update(payload)
          .eq("id", reflectionId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("daily_reflections")
          .insert(payload)
          .select("id")
          .single();
        if (error) throw error;
        if (data) setReflectionId(data.id);
      }

      setReflectionDirty(false);
      onUpdated?.();
      toast({
        title: t("evening_reflection.reflection_saved", "Riflessione salvata!"),
        description: t("evening_reflection.reflection_saved_desc", "Ottimo lavoro nel riflettere sulla tua giornata"),
      });
    } catch (err) {
      console.error("Error saving reflection:", err);
      toast({
        title: t("common.error", "Errore"),
        description: t("evening_reflection.could_not_save", "Impossibile salvare la riflessione"),
        variant: "destructive",
      });
    } finally {
      setSavingReflection(false);
    }
  };

  // Check if there's any data to show sections
  const hasHabits = dayData?.habits && dayData.habits.length > 0;
  const hasTasks = dayData?.tasks && dayData.tasks.length > 0;
  const hasNotToDo = dayData?.notToDo && dayData.notToDo.length > 0;
  const hasChallenges = dayData?.detoxChallenges && dayData.detoxChallenges.length > 0;
  const hasRecoveryCheckInOrJourney = !!(dayData?.recoveryCheckIn || dayData?.recoveryJourneyId);
  const hasChallengeEntries = dayData?.challengeEntries && dayData.challengeEntries.length > 0;

  const stringsToTranslate = useMemo(() => {
    if (!dayData) return [];
    const currentLang = (i18n.resolvedLanguage || i18n.language || "it").toLowerCase().split("-")[0];
    const out: string[] = [];
    const add = (s: string | null | undefined, origLang?: string | null) => {
      if (s && String(s).trim()) {
        const cLang = (origLang || "it").toLowerCase().split("-")[0];
        if (cLang !== currentLang) {
          out.push(String(s).trim());
        }
      }
    };
    for (const h of dayData.habits) add(h.title, h.original_language);
    for (const c of dayData.detoxChallenges) add(c.title);
    for (const e of dayData.challengeEntries) {
      add(e.challenge_title);
      add(e.checkin_response ?? undefined, e.original_language);
    }
    for (const tk of dayData.tasks) add(tk.title, tk.original_language);
    for (const n of dayData.notToDo) add(n.title, n.original_language);
    if (dayData.recoveryCheckIn?.notes) {
      add(dayData.recoveryCheckIn.notes, dayData.recoveryCheckIn.original_language);
    }
    return out;
  }, [dayData, i18n.resolvedLanguage, i18n.language]);

  const { display, ready: translateReady, needsRemote } = useUiBatchTranslation(
    stringsToTranslate,
    open && !loading && !!dayData
  );

  const Section = ({ 
    icon: Icon, 
    title, 
    iconColor, 
    badge,
    children 
  }: { 
    icon: React.ElementType; 
    title: string; 
    iconColor: string;
    badge?: React.ReactNode;
    children: React.ReactNode;
  }) => (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${iconColor}`} />
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        </div>
        {badge}
      </div>
      <div className="pl-6">
        {children}
      </div>
    </section>
  );

  const NotRecorded = ({ message }: { message: string }) => (
    <p className="text-sm text-muted-foreground italic">{message}</p>
  );

  const completedHabitsCount = dayData?.habits.filter(h => h.completed).length || 0;
  const totalHabitsCount = dayData?.habits.length || 0;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-lg max-h-[88vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-border/50 flex-shrink-0">
          <DialogTitle className="text-lg font-semibold capitalize">
            {format(date, "EEEE, d MMMM yyyy", { locale: dateLocale })}
          </DialogTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("activity_calendar.subtitle", "Clicca sugli elementi qui sotto per aggiornare o registrare le attività")}
          </p>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {needsRemote && !translateReady ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="p-6 space-y-6">
                
                {/* 1. DAILY CHECK-IN SECTION (Editable) */}
                <Section
                  icon={Sparkles}
                  title={t("day_detail_modal.daily_checkin")}
                  iconColor="text-rose-500"
                  badge={
                    dayData?.dailyCheckIn && !checkInDirty ? (
                      <Badge variant="secondary" className="text-[11px] bg-primary/10 text-primary">
                        {t("common.completed", "Completato")}
                      </Badge>
                    ) : null
                  }
                >
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {t("evening_reflection.how_feel", "Come ti sei sentito?")}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {MOOD_OPTIONS.map((opt) => {
                          const isSelected = mood === opt.value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => {
                                setMood(opt.value);
                                setCheckInDirty(true);
                                handleSaveDailyCheckIn(opt.value, energyLevel[0]);
                              }}
                              className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all flex items-center gap-1.5 ${
                                isSelected
                                  ? `${opt.color} border-2 shadow-sm`
                                  : "bg-muted/40 border-border/60 hover:bg-muted text-foreground"
                              }`}
                            >
                              <span>{opt.emoji}</span>
                              <span>{t(`day_detail_modal.mood.${opt.value}`, opt.value)}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Battery className="h-3.5 w-3.5 text-amber-500" />
                          {t("day_detail_modal.energy_label", "Livello di Energia")}
                        </span>
                        <Badge variant="outline" className="font-mono text-xs">
                          {energyLevel[0]}/10
                        </Badge>
                      </div>
                      <Slider
                        value={energyLevel}
                        onValueChange={(val) => {
                          setEnergyLevel(val);
                          setCheckInDirty(true);
                        }}
                        max={10}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    {checkInDirty && mood && (
                      <Button
                        size="sm"
                        onClick={() => handleSaveDailyCheckIn()}
                        disabled={savingCheckIn}
                        className="h-8 rounded-lg gradient-primary text-primary-foreground text-xs font-semibold gap-1.5"
                      >
                        {savingCheckIn ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Save className="h-3.5 w-3.5" />
                        )}
                        {t("common.save", "Salva")}
                      </Button>
                    )}
                  </div>
                </Section>

                <Separator className="bg-border/50" />
                
                {/* 2. HABITS SECTION (Interactive Toggle) */}
                <Section
                  icon={Check}
                  title={t("day_detail_modal.habits")}
                  iconColor="text-emerald-500"
                  badge={
                    totalHabitsCount > 0 ? (
                      <span className="text-xs font-semibold text-muted-foreground">
                        <span className="text-primary">{completedHabitsCount}</span>/{totalHabitsCount}
                      </span>
                    ) : null
                  }
                >
                  {hasHabits ? (
                    <div className="space-y-2">
                      {dayData?.habits.map((habit) => {
                        const isBusy = togglingHabitId === habit.id;
                        return (
                          <button
                            key={habit.id}
                            type="button"
                            onClick={() => handleToggleHabit(habit)}
                            disabled={isBusy}
                            className={`w-full flex items-center justify-between gap-3 p-2.5 rounded-xl border text-left transition-all ${
                              habit.completed
                                ? "bg-emerald-500/10 border-emerald-500/30 text-foreground"
                                : "bg-muted/30 border-border/50 hover:bg-muted/60 text-muted-foreground"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              {isBusy ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary flex-shrink-0" />
                              ) : habit.completed ? (
                                <SmallCheck />
                              ) : (
                                <SmallX />
                              )}
                              <span className="text-sm font-medium truncate">{display(habit.title)}</span>
                            </div>
                            <span
                              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                                habit.completed
                                  ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                                  : "bg-red-500/10 text-red-500"
                              }`}
                            >
                              {habit.completed
                                ? t("common.done", "Fatto")
                                : t("common.not_done", "Non fatto")}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <NotRecorded message={t("day_detail_modal.no_habits")} />
                  )}
                </Section>

                <Separator className="bg-border/50" />

                {/* 3. DAILY TASKS SECTION (Interactive Toggle + Add/Delete) */}
                <Section icon={ListTodo} title={t("day_detail_modal.daily_tasks")} iconColor="text-blue-500">
                  <div className="space-y-3">
                    {hasTasks ? (
                      <div className="space-y-2">
                        {dayData?.tasks.map((task) => {
                          const isBusy = togglingTaskId === task.id;
                          return (
                            <div
                              key={task.id}
                              className={`flex items-center justify-between gap-2 p-2.5 rounded-xl border transition-all ${
                                task.is_completed
                                  ? "bg-emerald-500/10 border-emerald-500/30 text-foreground"
                                  : "bg-muted/30 border-border/50 text-muted-foreground"
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => handleToggleTask(task)}
                                disabled={isBusy}
                                className="flex items-center gap-2.5 flex-1 min-w-0 text-left"
                              >
                                {isBusy ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary flex-shrink-0" />
                                ) : task.is_completed ? (
                                  <SmallCheck />
                                ) : (
                                  <SmallX />
                                )}
                                <span
                                  className={`text-sm font-medium truncate ${
                                    task.is_completed ? "text-foreground" : "text-muted-foreground"
                                  }`}
                                >
                                  {display(task.title)}
                                </span>
                              </button>
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleToggleTask(task)}
                                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                                    task.is_completed
                                      ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                                      : "bg-red-500/10 text-red-500"
                                  }`}
                                >
                                  {task.is_completed
                                    ? t("common.done", "Fatto")
                                    : t("common.not_done", "Non fatto")}
                                </button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleDeleteTask(task.id)}
                                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <NotRecorded message={t("day_detail_modal.no_tasks")} />
                    )}

                    {/* Quick Add Task for this day */}
                    <div className="flex gap-2 pt-1">
                      <Input
                        placeholder={t("todo_section.add_task", "Aggiungi task...")}
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
                        className="h-9 text-xs"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleAddTask}
                        disabled={addingTask || !newTaskTitle.trim()}
                        className="h-9 px-3 shrink-0"
                      >
                        {addingTask ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </Section>

                <Separator className="bg-border/50" />

                {/* 4. NOT-TO-DO SECTION (Interactive Avoided / Broken Toggle) */}
                <Section icon={Ban} title={t("day_detail_modal.things_to_avoid")} iconColor="text-orange-500">
                  <div className="space-y-3">
                    {hasNotToDo ? (
                      <div className="space-y-2">
                        {dayData?.notToDo.map((item) => {
                          const isBusy = updatingNotToDoId === item.id;
                          const isAvoided = item.status === "avoided";
                          const isBroken = item.status === "broken" || item.status === "failed";
                          return (
                            <div
                              key={item.id}
                              className={`flex items-center justify-between gap-2 p-2.5 rounded-xl border transition-all ${
                                isAvoided
                                  ? "bg-emerald-500/10 border-emerald-500/30"
                                  : isBroken
                                    ? "bg-red-500/10 border-red-500/30"
                                    : "bg-muted/30 border-border/50"
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                {isAvoided ? <SmallCheck /> : <SmallX />}
                                <span className="text-sm font-medium truncate text-foreground">
                                  {display(item.title)}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <Button
                                  size="sm"
                                  variant={isAvoided ? "default" : "outline"}
                                  disabled={isBusy}
                                  onClick={() => handleUpdateNotToDo(item, "avoided")}
                                  className={`h-7 px-2.5 text-xs gap-1 ${
                                    isAvoided ? "bg-emerald-600 hover:bg-emerald-500 text-white border-transparent" : ""
                                  }`}
                                >
                                  <ShieldCheck className="h-3.5 w-3.5" />
                                  {t("not_to_do_section.avoided", "Evitato")}
                                </Button>
                                <Button
                                  size="sm"
                                  variant={isBroken ? "default" : "outline"}
                                  disabled={isBusy}
                                  onClick={() => handleUpdateNotToDo(item, "broken")}
                                  className={`h-7 px-2.5 text-xs gap-1 ${
                                    isBroken ? "bg-destructive hover:bg-destructive/90 text-white border-transparent" : ""
                                  }`}
                                >
                                  <ShieldAlert className="h-3.5 w-3.5" />
                                  {t("not_to_do_section.not_avoided", "Non evitato")}
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <NotRecorded message={t("day_detail_modal.no_not_to_do")} />
                    )}

                    {/* Quick Add Not-To-Do Item */}
                    <div className="flex gap-2 pt-1">
                      <Input
                        placeholder={t("not_to_do_section.add_item", "Aggiungi comportamento da evitare...")}
                        value={newNotToDoTitle}
                        onChange={(e) => setNewNotToDoTitle(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddNotToDoItem()}
                        className="h-9 text-xs"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleAddNotToDoItem}
                        disabled={addingNotToDo || !newNotToDoTitle.trim()}
                        className="h-9 px-3 shrink-0"
                      >
                        {addingNotToDo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </Section>

                <Separator className="bg-border/50" />

                {/* 5. DETOX CHALLENGES & RECOVERY CHECK-IN SECTION */}
                <Section icon={Flame} title={t("day_detail_modal.detox_challenges")} iconColor="text-amber-500">
                  {hasChallenges ? (
                    <div className="space-y-3">
                      {dayData?.detoxChallenges.map((challenge, i) => {
                        const wasCheckedThisDay = challenge.last_check_in === dateStr;
                        return (
                          <div key={i} className="space-y-1">
                            <div className="flex items-center gap-2">
                              {wasCheckedThisDay ? <SmallCheck /> : <SmallX />}
                              <span className={`text-sm ${wasCheckedThisDay ? "text-foreground" : "text-muted-foreground"}`}>
                                {display(challenge.title)}
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
                    </div>
                  ) : (
                    <NotRecorded message={t("day_detail_modal.no_challenges")} />
                  )}

                  {/* Recovery check-in (Interactive if user has recovery journey or existing check-in) */}
                  {hasRecoveryCheckInOrJourney && (
                    <div className="mt-4 pt-3 border-t border-border/30 space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">
                        {t("day_detail_modal.recovery_checkin", "Check-in di Recupero")}
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant={dayData?.recoveryCheckIn?.status === "success" ? "default" : "outline"}
                          disabled={updatingRecovery}
                          onClick={() => handleRecoveryStatus("success")}
                          className={`h-8 text-xs gap-1.5 ${
                            dayData?.recoveryCheckIn?.status === "success"
                              ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                              : ""
                          }`}
                        >
                          <Heart className="h-3.5 w-3.5" />
                          {t("day_detail_modal.clean_day", "Giorno pulito")}
                        </Button>
                        <Button
                          size="sm"
                          variant={dayData?.recoveryCheckIn?.status === "failed" ? "default" : "outline"}
                          disabled={updatingRecovery}
                          onClick={() => handleRecoveryStatus("failed")}
                          className={`h-8 text-xs gap-1.5 ${
                            dayData?.recoveryCheckIn?.status === "failed"
                              ? "bg-destructive hover:bg-destructive/90 text-white"
                              : ""
                          }`}
                        >
                          <X className="h-3.5 w-3.5" />
                          {t("day_detail_modal.relapse_occurred", "Ricaduta avvenuta")}
                        </Button>
                      </div>
                      {dayData?.recoveryCheckIn?.notes && (
                        <p className="text-sm text-muted-foreground italic">
                          &ldquo;{display(dayData.recoveryCheckIn.notes)}&rdquo;
                        </p>
                      )}
                    </div>
                  )}
                </Section>

                {hasChallengeEntries && (
                  <>
                    <Separator className="bg-border/50" />
                    {/* CHALLENGE JOURNEY ENTRIES */}
                    <Section icon={Shield} title={t("day_detail_modal.challenge_journey")} iconColor="text-purple-500">
                      <div className="space-y-3">
                        {dayData?.challengeEntries.map((entry, i) => (
                          <div key={i} className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              {entry.is_failure ? <SmallX /> : <SmallCheck />}
                              <span className={`text-sm ${entry.is_failure ? "text-muted-foreground" : "text-foreground"}`}>
                                {entry.is_failure
                                  ? t("day_detail_modal.setback")
                                  : entry.checkin_response
                                    ? display(entry.checkin_response)
                                    : t("day_detail_modal.checkin_recorded_fallback")}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 ml-5">
                              <span className="text-xs text-muted-foreground" title={t("day_detail_modal.mental_mission")}>
                                🧠 {entry.mental_mission_completed ? "✓" : "✗"}
                              </span>
                              <span className="text-xs text-muted-foreground" title={t("day_detail_modal.behavioral_mission")}>
                                💪 {entry.behavioral_mission_completed ? "✓" : "✗"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Section>
                  </>
                )}

                <Separator className="bg-border/50" />

                {/* 6. EVENING REFLECTION (Full Interactive Editor for this day) */}
                <Section
                  icon={Moon}
                  title={t("day_detail_modal.evening_reflection")}
                  iconColor="text-indigo-500"
                  badge={
                    reflectionDirty ? (
                      <span className="text-xs text-amber-500 font-medium">
                        {t("common.unsaved", "Non salvato")}
                      </span>
                    ) : reflectionId ? (
                      <Badge variant="secondary" className="text-[11px] bg-primary/10 text-primary">
                        {t("common.completed", "Salvato")}
                      </Badge>
                    ) : null
                  }
                >
                  <div className="space-y-4">
                    {/* Day summary tags */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground block">
                        {t("day_detail_modal.how_was_your_day", "Com'è andata la tua giornata?")}
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {DAY_SUMMARY_OPTIONS.map((option) => {
                          const Icon = option.icon;
                          const isSelected = daySummaryTags.includes(option.value);
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => toggleReflectionTag("day_summary", option.value)}
                              className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all flex items-center gap-1.5 ${
                                isSelected
                                  ? `${option.color} border-2`
                                  : "bg-muted/40 border-border/60 hover:bg-muted text-foreground"
                              }`}
                            >
                              <Icon className="h-3.5 w-3.5" />
                              <span>{t(`evening_reflection.moods.${option.value}`, option.label)}</span>
                              {isSelected && <Check className="h-3 w-3" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Gratitude items */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                        <Heart className="h-3.5 w-3.5 text-pink-500" />
                        {t("evening_reflection.grateful_for", "Di cosa sei grato? (1-3 cose)")}
                      </label>
                      <div className="flex gap-2">
                        <Input
                          placeholder={t("evening_reflection.grateful_placeholder", "Aggiungi qualcosa per cui sei grato...")}
                          value={newGratitude}
                          onChange={(e) => setNewGratitude(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleAddGratitude()}
                          disabled={gratefulFor.length >= 3}
                          className="h-9 text-xs flex-1"
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={handleAddGratitude}
                          disabled={gratefulFor.length >= 3 || !newGratitude.trim()}
                          className="h-9 px-3 shrink-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {gratefulFor.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {gratefulFor.map((item, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-400 text-xs font-medium"
                            >
                              <Heart className="h-3 w-3" />
                              {display(item)}
                              <button
                                type="button"
                                onClick={() => handleRemoveGratitude(idx)}
                                className="ml-1 hover:text-pink-800 dark:hover:text-pink-200"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Lessons learned tags */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                        <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                        {t("day_detail_modal.lessons_learned", "Lezioni apprese")}
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {LESSONS_OPTIONS.map((option) => {
                          const Icon = option.icon;
                          const isSelected = lessonsTags.includes(option.value);
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => toggleReflectionTag("lessons_learned", option.value)}
                              className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all flex items-center gap-1.5 ${
                                isSelected
                                  ? `${option.color} border-2`
                                  : "bg-muted/40 border-border/60 hover:bg-muted text-foreground"
                              }`}
                            >
                              <Icon className="h-3.5 w-3.5" />
                              <span>{t(`evening_reflection.lessons.${option.value}`, option.label)}</span>
                              {isSelected && <Check className="h-3 w-3" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Save Reflection Button */}
                    <div className="flex justify-end pt-1">
                      <Button
                        size="sm"
                        onClick={handleSaveReflection}
                        disabled={
                          savingReflection ||
                          (!reflectionDirty && !!reflectionId) ||
                          (daySummaryTags.length === 0 && gratefulFor.length === 0 && lessonsTags.length === 0)
                        }
                        className="gap-1.5 bg-[#9B5BDB] hover:bg-[#8b4bca] text-white font-semibold shadow-soft rounded-xl"
                      >
                        {savingReflection ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            {t("common.saving", "Salvataggio...")}
                          </>
                        ) : (
                          <>
                            <Save className="h-3.5 w-3.5" />
                            {t("evening_reflection.save_reflection", "Salva Riflessione")}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </Section>

              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
