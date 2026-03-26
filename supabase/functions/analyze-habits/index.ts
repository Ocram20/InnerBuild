import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-XSS-Protection": "1; mode=block",
};

interface HabitLog {
  habit_id: string;
  completed_at: string;
  created_at: string;
}

interface Habit {
  id: string;
  title: string;
  reminder_time: string | null;
  frequency: string;
}

interface HabitAdaptationRow {
  habit_id: string;
  status: "pending" | "accepted" | "dismissed";
  created_at: string;
}

interface PatternAnalysis {
  habitId: string;
  completionRate: number;
  avgCompletionHour: number | null;
  bestDayOfWeek: number | null;
  worstDayOfWeek: number | null;
  morningPerson: boolean;
  eveningPerson: boolean;
  weekendStruggler: boolean;
  consecutiveMisses: number;
  totalCompletions: number;
  totalExpected: number;
}

interface Adaptation {
  habitId: string;
  type: "timing" | "difficulty" | "frequency" | "alternative";
  originalValue: string | null;
  suggestedValue: string;
  reason: string;
  patternData: PatternAnalysis;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Create auth client to verify the user
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await authClient.auth.getUser();
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use the authenticated user's ID - never trust userId from request body
    const userId = user.id;

    // Create service client for database operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch user's habits
    const { data: habits, error: habitsError } = await supabase
      .from("habits")
      .select("id, title, reminder_time, frequency")
      .eq("user_id", userId)
      .eq("is_active", true);

    if (habitsError) throw habitsError;
    if (!habits || habits.length === 0) {
      return new Response(
        JSON.stringify({ adaptations: [], analytics: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch habit logs for the last 14 days
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    
    const { data: logs, error: logsError } = await supabase
      .from("habit_logs")
      .select("habit_id, completed_at, created_at")
      .eq("user_id", userId)
      .gte("completed_at", twoWeeksAgo.toISOString().split("T")[0]);

    if (logsError) throw logsError;

    // Analyze patterns for each habit
    const patterns: PatternAnalysis[] = [];
    const adaptations: Adaptation[] = [];

    // Fetch recent adaptations to avoid re-suggesting immediately after an accept/dismiss
    const habitIds = (habits as Habit[]).map(h => h.id);
    const { data: recentAdaptations, error: recentAdaptationsError } = await supabase
      .from("habit_adaptations")
      .select("habit_id, status, created_at")
      .eq("user_id", userId)
      .in("habit_id", habitIds)
      .order("created_at", { ascending: false });

    if (recentAdaptationsError) throw recentAdaptationsError;

    // Build map of latest accepted adaptation date per habit
    const latestAcceptedAtByHabit = new Map<string, Date>();
    const latestAnyAtByHabit = new Map<string, Date>();
    for (const row of (recentAdaptations || []) as HabitAdaptationRow[]) {
      const createdAt = new Date(row.created_at);
      if (!latestAnyAtByHabit.has(row.habit_id)) {
        latestAnyAtByHabit.set(row.habit_id, createdAt);
      }
      if (row.status === "accepted" && !latestAcceptedAtByHabit.has(row.habit_id)) {
        latestAcceptedAtByHabit.set(row.habit_id, createdAt);
      }
    }

    const COOLDOWN_DAYS_AFTER_ACCEPT = 7;

    for (const habit of habits as Habit[]) {
      // Cooldown: if user accepted a change recently, don't suggest another for the same habit yet
      const lastAcceptedAt = latestAcceptedAtByHabit.get(habit.id);
      if (lastAcceptedAt) {
        const cooldownUntil = new Date(lastAcceptedAt);
        cooldownUntil.setDate(cooldownUntil.getDate() + COOLDOWN_DAYS_AFTER_ACCEPT);
        if (new Date() < cooldownUntil) {
          const habitLogs = (logs || []).filter((l: HabitLog) => l.habit_id === habit.id);
          const pattern = analyzeHabitPattern(habit, habitLogs);
          patterns.push(pattern);
          continue;
        }
      }

      const habitLogs = (logs || []).filter((l: HabitLog) => l.habit_id === habit.id);
      const pattern = analyzeHabitPattern(habit, habitLogs);
      patterns.push(pattern);

      // Generate adaptations based on patterns
      const adaptation = generateAdaptation(habit, pattern);
      if (adaptation) {
        // Safety: avoid useless suggestions (e.g. 1 -> 1)
        if ((adaptation.originalValue || "").trim() === adaptation.suggestedValue.trim()) {
          continue;
        }
        adaptations.push(adaptation);
      }
    }

    // Store adaptations in database
    const weekStart = getWeekStart(new Date());

    for (const adaptation of adaptations) {
      // Check if there's already a pending adaptation for this habit
      const { data: existing } = await supabase
        .from("habit_adaptations")
        .select("id")
        .eq("habit_id", adaptation.habitId)
        .eq("status", "pending")
        .single();

      if (!existing) {
        await supabase.from("habit_adaptations").insert({
          user_id: userId,
          habit_id: adaptation.habitId,
          adaptation_type: adaptation.type,
          original_value: adaptation.originalValue,
          suggested_value: adaptation.suggestedValue,
          reason: adaptation.reason,
          pattern_data: adaptation.patternData,
          status: "pending",
        });
      }
    }

    // Update analytics
    for (const pattern of patterns) {
      await supabase.from("habit_analytics").upsert({
        user_id: userId,
        habit_id: pattern.habitId,
        week_start: weekStart,
        completion_rate: pattern.completionRate,
        avg_completion_hour: pattern.avgCompletionHour,
        best_day_of_week: pattern.bestDayOfWeek,
        worst_day_of_week: pattern.worstDayOfWeek,
        current_streak: 0, // Would need more logic
        total_completions: pattern.totalCompletions,
        total_misses: pattern.totalExpected - pattern.totalCompletions,
        morning_person: pattern.morningPerson,
        evening_person: pattern.eveningPerson,
        weekend_struggler: pattern.weekendStruggler,
      }, {
        onConflict: "habit_id,week_start",
      });
    }

    // Fetch pending adaptations to return
    const { data: pendingAdaptations } = await supabase
      .from("habit_adaptations")
      .select("*, habits(title)")
      .eq("user_id", userId)
      .eq("status", "pending");

    return new Response(
      JSON.stringify({ 
        adaptations: pendingAdaptations || [],
        analytics: patterns 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in analyze-habits function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function analyzeHabitPattern(habit: Habit, logs: HabitLog[]): PatternAnalysis {
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  // Count expected completions (daily = 14, weekly = 2)
  const expectedDays = habit.frequency === "daily" ? 14 : 2;
  const completionRate = logs.length > 0 
    ? Math.min((logs.length / expectedDays) * 100, 100) 
    : 0;

  // Analyze completion times
  const completionHours: number[] = [];
  const dayCompletions: Record<number, number> = {0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0};
  
  for (const log of logs) {
    const date = new Date(log.created_at);
    completionHours.push(date.getHours());
    dayCompletions[date.getDay()]++;
  }

  const avgCompletionHour = completionHours.length > 0
    ? Math.round(completionHours.reduce((a, b) => a + b, 0) / completionHours.length)
    : null;

  // Find best/worst days
  let bestDay: number | null = null;
  let worstDay: number | null = null;
  let maxCount = -1;
  let minCount = Infinity;

  for (const [day, count] of Object.entries(dayCompletions)) {
    if (count > maxCount) {
      maxCount = count;
      bestDay = parseInt(day);
    }
    if (count < minCount) {
      minCount = count;
      worstDay = parseInt(day);
    }
  }

  // Pattern flags
  const morningPerson = avgCompletionHour !== null && avgCompletionHour < 12;
  const eveningPerson = avgCompletionHour !== null && avgCompletionHour >= 18;
  
  const weekendCompletions = dayCompletions[0] + dayCompletions[6];
  const weekdayCompletions = dayCompletions[1] + dayCompletions[2] + dayCompletions[3] + dayCompletions[4] + dayCompletions[5];
  const weekendStruggler = logs.length >= 7 && 
    (weekendCompletions / 2) < (weekdayCompletions / 5) * 0.5;

  // Count consecutive misses (looking at last 7 days)
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);
  const recentLogs = logs.filter(l => new Date(l.completed_at) >= lastWeek);
  const consecutiveMisses = Math.max(0, 7 - recentLogs.length);

  return {
    habitId: habit.id,
    completionRate,
    avgCompletionHour,
    bestDayOfWeek: bestDay,
    worstDayOfWeek: worstDay,
    morningPerson,
    eveningPerson,
    weekendStruggler,
    consecutiveMisses,
    totalCompletions: logs.length,
    totalExpected: expectedDays,
  };
}

function generateAdaptation(habit: Habit, pattern: PatternAnalysis): Adaptation | null {
  // Only suggest adaptations if there's a clear struggle
  if (pattern.completionRate >= 80) {
    return null; // Doing great, no changes needed
  }

  // Priority 1: Timing adjustment if they have a reminder time set
  if (habit.reminder_time && pattern.avgCompletionHour !== null) {
    const reminderHour = parseInt(habit.reminder_time.split(":")[0]);
    const actualHour = pattern.avgCompletionHour;
    
    // If they consistently complete 2+ hours after reminder, suggest new time
    if (actualHour > reminderHour + 1) {
      const suggestedHour = Math.min(actualHour, 21); // Don't suggest later than 9pm
      const suggestedTime = `${suggestedHour.toString().padStart(2, "0")}:00`;
      
      return {
        habitId: habit.id,
        type: "timing",
        originalValue: habit.reminder_time,
        suggestedValue: suggestedTime,
        reason: `You usually complete this habit around ${formatHour(actualHour)} instead of ${formatHour(reminderHour)}. Adjusting the reminder might help.`,
        patternData: pattern,
      };
    }
  }

  // Priority 2: If completion rate is very low, suggest making it easier
  if (pattern.completionRate < 40) {
    if (pattern.weekendStruggler) {
      return {
        habitId: habit.id,
        type: "frequency",
        originalValue: habit.frequency,
        suggestedValue: "weekdays",
        reason: `Completion rate: ${pattern.completionRate.toFixed(0)}%. Try focusing on weekdays first before expanding.`,
        patternData: pattern,
      };
    }
    
    // Generate a concrete easier version based on the habit title
    const easierVersion = generateEasierVersion(habit.title);
    
    return {
      habitId: habit.id,
      type: "difficulty",
      originalValue: habit.title,
      suggestedValue: easierVersion.newTitle,
      reason: easierVersion.reason,
      patternData: pattern,
    };
  }

  // Priority 3: If moderate struggles, suggest timing based on their natural pattern
  if (pattern.completionRate < 60 && pattern.avgCompletionHour !== null) {
    if (!habit.reminder_time) {
      const suggestedTime = `${pattern.avgCompletionHour.toString().padStart(2, "0")}:00`;
      return {
        habitId: habit.id,
        type: "timing",
        originalValue: null,
        suggestedValue: suggestedTime,
        reason: `You tend to complete habits around ${formatHour(pattern.avgCompletionHour)}. Setting a reminder at that time could improve consistency.`,
        patternData: pattern,
      };
    }
  }

  return null;
}

// Generate a concrete easier version of a habit with sensible minimums
function generateEasierVersion(title: string): { newTitle: string; reason: string } {
  const titleLower = title.toLowerCase();
  
  // Define minimum thresholds for common habit types
  const minimums: Record<string, number> = {
    // Sleep-related (hours)
    "hour": 7,
    "ora": 7,
    "ore": 7,
    "hours": 7,
    // Water (glasses)
    "bicchier": 6,
    "glass": 6,
    // Exercise duration (minutes)
    "minute": 10,
    "minuti": 10,
    "min": 5,
    // Pages
    "page": 3,
    "pagin": 3,
    // Reps
    "push": 5,
    "squat": 5,
    // Distance
    "km": 1,
    "kilometer": 1,
    "chilometr": 1,
  };
  
  // Pattern: numbers in the title (e.g., "8 bicchieri", "30 minuti", "10 pagine")
  const numberMatch = title.match(/(\d+)\s*(bicchier|glass|minute|minuti|page|pagin|push.?up|squat|km|kilometer|chilometr|hour|ora|ore|hours)/i);
  
  if (numberMatch) {
    const originalNumber = parseInt(numberMatch[1]);
    const unit = numberMatch[2].toLowerCase();
    
    // Find the minimum for this unit type
    let minimum = 1;
    for (const [key, min] of Object.entries(minimums)) {
      if (unit.includes(key) || key.includes(unit.substring(0, 3))) {
        minimum = min;
        break;
      }
    }
    
    // Calculate reduced value: reduce by 20-30% but respect minimum
    const reducedNumber = Math.max(minimum, Math.floor(originalNumber * 0.75));
    
    // Don't suggest if the reduction is too small (less than 10% difference)
    if (reducedNumber >= originalNumber * 0.9) {
      return {
        newTitle: title,
        reason: `This habit is already at a reasonable level. Focus on consistency rather than reducing it further.`,
      };
    }
    
    const newTitle = title.replace(numberMatch[1], reducedNumber.toString());
    
    return {
      newTitle,
      reason: `"${title}" is hard to maintain. Try "${newTitle}" to build the habit, then increase gradually.`,
    };
  }
  
  // Pattern: time durations (e.g., "Meditazione 20 min")
  const timeMatch = title.match(/(\d+)\s*(min|sec|hour|ora|ore)/i);
  if (timeMatch) {
    const originalTime = parseInt(timeMatch[1]);
    const unit = timeMatch[2].toLowerCase();
    
    // Set sensible minimums based on unit
    let minimum = 1;
    if (unit.includes("hour") || unit.includes("ora") || unit.includes("ore")) {
      minimum = 7; // Sleep minimum
    } else if (unit.includes("min")) {
      minimum = 5; // Minimum meaningful duration
    }
    
    const reducedTime = Math.max(minimum, Math.floor(originalTime * 0.75));
    
    if (reducedTime >= originalTime * 0.9) {
      return {
        newTitle: title,
        reason: `This habit is already at a reasonable level. Focus on consistency.`,
      };
    }
    
    const newTitle = title.replace(timeMatch[1], reducedTime.toString());
    
    return {
      newTitle,
      reason: `${originalTime} ${timeMatch[2]} might be too much. Start with ${reducedTime} ${timeMatch[2]} and increase gradually.`,
    };
  }
  
  // Pattern: workout/exercise habits
  if (titleLower.includes("palestra") || titleLower.includes("gym") || titleLower.includes("workout") || titleLower.includes("allenamento")) {
    return {
      newTitle: title + " (light version)",
      reason: `Full workouts are hard to maintain. Try a reduced version: 15 minutes instead of a full session.`,
    };
  }
  
  // Pattern: reading habits
  if (titleLower.includes("legg") || titleLower.includes("read") || titleLower.includes("libro") || titleLower.includes("book")) {
    return {
      newTitle: "Read 5 pages",
      reason: `Start with just 5 pages per day. It's easier to maintain and builds the habit gradually.`,
    };
  }
  
  // Pattern: meditation
  if (titleLower.includes("medit") || titleLower.includes("mindful")) {
    return {
      newTitle: "3-minute meditation",
      reason: `Start with just 3 minutes of meditation. You can increase gradually once it becomes routine.`,
    };
  }
  
  // Pattern: water/hydration
  if (titleLower.includes("acqua") || titleLower.includes("water") || titleLower.includes("idrat") || titleLower.includes("bicchier")) {
    return {
      newTitle: "6 glasses of water",
      reason: `Reduce to 6 glasses for now. Once it becomes automatic, you can increase gradually.`,
    };
  }
  
  // Default: add "micro" version
  return {
    newTitle: `${title} (mini version)`,
    reason: `You're struggling with this habit. Try a reduced version to build consistency, then increase gradually.`,
  };
}

function formatHour(hour: number): string {
  if (hour === 0) return "12 AM";
  if (hour === 12) return "12 PM";
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
}

function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  d.setDate(diff);
  return d.toISOString().split("T")[0];
}
