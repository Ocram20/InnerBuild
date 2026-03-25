import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { format, subDays } from "date-fns";

export interface ProgressOverview {
  habits: {
    currentRate: number;
    previousRate: number;
    trend: "up" | "down" | "stable";
    trendValue: number;
  };
  triggers: {
    currentCount: number;
    previousCount: number;
    trend: "up" | "down" | "stable";
    trendValue: number;
  };
  challenges: {
    completed: number;
    active: number;
  };
  mood: {
    currentAvg: number;
    previousAvg: number;
    trend: "up" | "down" | "stable";
    topEmotions: string[];
    reflectionDays: number;
  };
}

export interface HabitProgressDetail {
  id: string;
  title: string;
  completionRate: number;
  streak: number;
  dailyData: { date: string; completed: boolean }[];
}

export interface TriggerProgressDetail {
  dailyData: { date: string; count: number }[];
  commonTimes: string[];
  commonEmotions: string[];
  aiInsight: string | null;
}

export interface ChallengeProgressDetail {
  id: string;
  title: string;
  category: string;
  status: string;
  daysResisted: number;
  durationDays: number;
  startDate: string;
}

export interface MoodProgressDetail {
  dailyData: { date: string; moodScore: number; mood: string }[];
  topEmotions: string[];
  reflectionCount: number;
  totalDays: number;
}

const MOOD_SCORES: Record<string, number> = {
  great: 5,
  good: 4,
  okay: 3,
  struggling: 2,
  difficult: 1,
};

export function useProgressData(days: number = 14) {
  const { user } = useAuth();
  const [overview, setOverview] = useState<ProgressOverview | null>(null);
  const [habitDetails, setHabitDetails] = useState<HabitProgressDetail[]>([]);
  const [triggerDetails, setTriggerDetails] = useState<TriggerProgressDetail | null>(null);
  const [challengeDetails, setChallengeDetails] = useState<ChallengeProgressDetail[]>([]);
  const [moodDetails, setMoodDetails] = useState<MoodProgressDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      const now = new Date();
      const currentStart = format(subDays(now, days), "yyyy-MM-dd");
      const previousStart = format(subDays(now, days * 2), "yyyy-MM-dd");
      const today = format(now, "yyyy-MM-dd");

      // Fetch all data in parallel
      const [
        habitsRes,
        habitLogsCurrent,
        habitLogsPrevious,
        triggersCurrent,
        triggersPrevious,
        challengesRes,
        checkinsCurrent,
        checkinsPrevious,
        reflectionsRes,
      ] = await Promise.all([
        supabase.from("habits").select("id, title").eq("user_id", user.id).eq("is_active", true),
        supabase.from("habit_logs").select("habit_id, completed_at").eq("user_id", user.id).gte("completed_at", currentStart),
        supabase.from("habit_logs").select("habit_id, completed_at").eq("user_id", user.id).gte("completed_at", previousStart).lt("completed_at", currentStart),
        supabase.from("trigger_logs").select("id, logged_at, emotion, time_context, impulse_intensity").eq("user_id", user.id).gte("logged_at", subDays(now, days).toISOString()),
        supabase.from("trigger_logs").select("id").eq("user_id", user.id).gte("logged_at", subDays(now, days * 2).toISOString()).lt("logged_at", subDays(now, days).toISOString()),
        supabase.from("detox_challenges").select("id, title, category, status, current_streak, duration_days, start_date").eq("user_id", user.id),
        supabase.from("daily_checkins").select("checkin_date, mood, energy_level").eq("user_id", user.id).gte("checkin_date", currentStart),
        supabase.from("daily_checkins").select("checkin_date, mood").eq("user_id", user.id).gte("checkin_date", previousStart).lt("checkin_date", currentStart),
        supabase.from("daily_reflections").select("reflection_date").eq("user_id", user.id).gte("reflection_date", currentStart),
      ]);

      const habits = habitsRes.data || [];
      const currentLogs = habitLogsCurrent.data || [];
      const prevLogs = habitLogsPrevious.data || [];
      const currentTriggers = triggersCurrent.data || [];
      const prevTriggers = triggersPrevious.data || [];
      const challenges = challengesRes.data || [];
      const currentCheckins = checkinsCurrent.data || [];
      const prevCheckins = checkinsPrevious.data || [];
      const reflections = reflectionsRes.data || [];

      // --- Habits Overview ---
      const totalPossibleCurrent = habits.length * days;
      const totalPossiblePrev = habits.length * days;
      const currentHabitRate = totalPossibleCurrent > 0 ? Math.round((currentLogs.length / totalPossibleCurrent) * 100) : 0;
      const prevHabitRate = totalPossiblePrev > 0 ? Math.round((prevLogs.length / totalPossiblePrev) * 100) : 0;
      const habitDiff = currentHabitRate - prevHabitRate;

      // --- Habit Details ---
      const habitDetailsList: HabitProgressDetail[] = habits.map(h => {
        const logs = currentLogs.filter(l => l.habit_id === h.id);
        const logDates = new Set(logs.map(l => l.completed_at));
        const dailyData: { date: string; completed: boolean }[] = [];

        for (let i = days - 1; i >= 0; i--) {
          const d = format(subDays(now, i), "yyyy-MM-dd");
          dailyData.push({ date: d, completed: logDates.has(d) });
        }

        // Calculate streak
        let streak = 0;
        for (let i = dailyData.length - 1; i >= 0; i--) {
          if (dailyData[i].completed) streak++;
          else break;
        }

        return {
          id: h.id,
          title: h.title,
          completionRate: Math.round((logs.length / days) * 100),
          streak,
          dailyData,
        };
      });

      // --- Triggers Overview ---
      const currentTriggerCount = currentTriggers.length;
      const prevTriggerCount = prevTriggers.length;
      const triggerDiff = prevTriggerCount > 0
        ? Math.round(((currentTriggerCount - prevTriggerCount) / prevTriggerCount) * 100)
        : 0;

      // --- Trigger Details ---
      const triggerDailyMap: Record<string, number> = {};
      const emotionMap: Record<string, number> = {};
      const timeMap: Record<string, number> = {};

      currentTriggers.forEach(t => {
        const d = format(new Date(t.logged_at), "yyyy-MM-dd");
        triggerDailyMap[d] = (triggerDailyMap[d] || 0) + 1;
        emotionMap[t.emotion] = (emotionMap[t.emotion] || 0) + 1;
        timeMap[t.time_context] = (timeMap[t.time_context] || 0) + 1;
      });

      const triggerDailyData: { date: string; count: number }[] = [];
      for (let i = days - 1; i >= 0; i--) {
        const d = format(subDays(now, i), "yyyy-MM-dd");
        triggerDailyData.push({ date: d, count: triggerDailyMap[d] || 0 });
      }

      const commonEmotions = Object.entries(emotionMap).sort((a, b) => b[1] - a[1]).slice(0, 3).map(e => e[0]);
      const commonTimes = Object.entries(timeMap).sort((a, b) => b[1] - a[1]).slice(0, 2).map(e => e[0]);

      // --- Challenges Overview ---
      const completedChallenges = challenges.filter(c => c.status === "completed");
      const activeChallenges = challenges.filter(c => c.status === "active");

      const challengeDetailsList: ChallengeProgressDetail[] = challenges
        .filter(c => c.status === "active" || c.status === "completed")
        .sort((a, b) => (a.status === "active" ? -1 : 1))
        .map(c => ({
          id: c.id,
          title: c.title,
          category: c.category,
          status: c.status,
          daysResisted: c.current_streak,
          durationDays: c.duration_days,
          startDate: c.start_date,
        }));

      // --- Mood Overview ---
      const currentMoodScores = currentCheckins.map(c => MOOD_SCORES[c.mood] || 3);
      const prevMoodScores = prevCheckins.map(c => MOOD_SCORES[c.mood] || 3);
      const currentMoodAvg = currentMoodScores.length > 0 ? currentMoodScores.reduce((a, b) => a + b, 0) / currentMoodScores.length : 0;
      const prevMoodAvg = prevMoodScores.length > 0 ? prevMoodScores.reduce((a, b) => a + b, 0) / prevMoodScores.length : 0;

      const moodEmotionMap: Record<string, number> = {};
      currentCheckins.forEach(c => {
        moodEmotionMap[c.mood] = (moodEmotionMap[c.mood] || 0) + 1;
      });
      const topMoodEmotions = Object.entries(moodEmotionMap).sort((a, b) => b[1] - a[1]).slice(0, 3).map(e => e[0]);

      const moodDailyData: { date: string; moodScore: number; mood: string }[] = [];
      const checkinsByDate = new Map(currentCheckins.map(c => [c.checkin_date, c]));
      for (let i = days - 1; i >= 0; i--) {
        const d = format(subDays(now, i), "yyyy-MM-dd");
        const checkin = checkinsByDate.get(d);
        if (checkin) {
          moodDailyData.push({ date: d, moodScore: MOOD_SCORES[checkin.mood] || 3, mood: checkin.mood });
        }
      }

      setOverview({
        habits: {
          currentRate: currentHabitRate,
          previousRate: prevHabitRate,
          trend: habitDiff > 2 ? "up" : habitDiff < -2 ? "down" : "stable",
          trendValue: Math.abs(habitDiff),
        },
        triggers: {
          currentCount: currentTriggerCount,
          previousCount: prevTriggerCount,
          trend: triggerDiff < -5 ? "up" : triggerDiff > 5 ? "down" : "stable",
          trendValue: Math.abs(triggerDiff),
        },
        challenges: {
          completed: completedChallenges.length,
          active: activeChallenges.length,
        },
        mood: {
          currentAvg: currentMoodAvg,
          previousAvg: prevMoodAvg,
          trend: currentMoodAvg - prevMoodAvg > 0.2 ? "up" : currentMoodAvg - prevMoodAvg < -0.2 ? "down" : "stable",
          topEmotions: topMoodEmotions,
          reflectionDays: reflections.length,
        },
      });

      setHabitDetails(habitDetailsList);
      setTriggerDetails({
        dailyData: triggerDailyData,
        commonTimes,
        commonEmotions,
        aiInsight: null,
      });
      setChallengeDetails(challengeDetailsList);
      setMoodDetails({
        dailyData: moodDailyData,
        topEmotions: topMoodEmotions,
        reflectionCount: reflections.length,
        totalDays: days,
      });
    } catch (err) {
      console.error("Error fetching progress data:", err);
    } finally {
      setLoading(false);
    }
  }, [user, days]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    overview,
    habitDetails,
    triggerDetails,
    challengeDetails,
    moodDetails,
    loading,
    refetch: fetchAll,
  };
}
