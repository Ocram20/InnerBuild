import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isFuture, startOfToday, isBefore } from "date-fns";
import { it, enUS } from "date-fns/locale";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { untypedTable } from "@/integrations/supabase/untyped-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { DayDetailModal } from "./DayDetailModal";

interface DayActivity {
  date: string;
  habitsCompleted: number;
  habitsTotal: number;
  hasEveningReflection: boolean;
  hasTasks: boolean;
  hasNotToDo: boolean;
  hasDetoxCheckIn: boolean;
  detoxSuccess: boolean;
  hasRecoveryCheckIn: boolean;
  recoverySuccess: boolean;
  hasDailyCheckIn: boolean;
  hasChallengeEntry: boolean;
  challengeEntrySuccess: boolean;
}

export function ActivityCalendar() {
  const dateLocale = i18n.language === "it" ? it : enUS;
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activities, setActivities] = useState<Map<string, DayActivity>>(new Map());
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Localized day names
  const dayNames = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(2024, 0, i); // Jan 2024 starts on Monday, but day 0 = Sun for index 0
    // Use a known Sunday as base: Jan 7 2024 is a Sunday
    const base = new Date(2024, 0, 7 + i);
    return format(base, "EEE", { locale: dateLocale });
  });

  const startPadding = monthStart.getDay();

  useEffect(() => {
    if (user) {
      fetchMonthActivities();
    }
  }, [user, currentMonth]);

  const fetchMonthActivities = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const startDate = format(monthStart, "yyyy-MM-dd");
      const endDate = format(monthEnd, "yyyy-MM-dd");

      const [
        habitsRes, 
        habitLogsRes, 
        dailyReflectionsRes, 
        tasksRes,
        notToDoRes,
        challengesRes,
        recoveryCheckInsRes,
        dailyCheckInsRes,
        challengeEntriesRes,
      ] = await Promise.all([
        supabase.from("habits").select("id").eq("user_id", user.id).eq("is_active", true),
        supabase.from("habit_logs").select("habit_id, completed_at").eq("user_id", user.id).gte("completed_at", startDate).lte("completed_at", endDate),
        supabase.from("daily_reflections").select("reflection_date").eq("user_id", user.id).gte("reflection_date", startDate).lte("reflection_date", endDate),
        supabase.from("daily_tasks").select("target_date").eq("user_id", user.id).gte("target_date", startDate).lte("target_date", endDate),
        supabase.from("not_to_do_items").select("target_date").eq("user_id", user.id).gte("target_date", startDate).lte("target_date", endDate),
        supabase.from("detox_challenges").select("last_check_in, status").eq("user_id", user.id).eq("status", "active"),
        supabase.from("recovery_checkins").select("checkin_date, status").eq("user_id", user.id).gte("checkin_date", startDate).lte("checkin_date", endDate),
        untypedTable("daily_checkins").select("checkin_date").eq("user_id", user.id).gte("checkin_date", startDate).lte("checkin_date", endDate),
        untypedTable("challenge_daily_entries").select("created_at, checkin_response, is_failure").eq("user_id", user.id),
      ]);

      const totalHabits = habitsRes.data?.length || 0;
      const activityMap = new Map<string, DayActivity>();

      const habitsByDate = new Map<string, Set<string>>();
      habitLogsRes.data?.forEach(log => {
        const date = log.completed_at;
        if (!habitsByDate.has(date)) habitsByDate.set(date, new Set());
        habitsByDate.get(date)!.add(log.habit_id);
      });

      const dailyReflectionDates = new Set(dailyReflectionsRes.data?.map(r => r.reflection_date) || []);
      const taskDates = new Set(tasksRes.data?.map(t => t.target_date) || []);
      const notToDoDates = new Set(notToDoRes.data?.map(n => n.target_date) || []);
      
      const detoxCheckInDates = new Set<string>();
      challengesRes.data?.forEach(c => { if (c.last_check_in) detoxCheckInDates.add(c.last_check_in); });

      const recoveryCheckInMap = new Map<string, boolean>();
      recoveryCheckInsRes.data?.forEach(c => { recoveryCheckInMap.set(c.checkin_date, c.status === "success"); });

      const dailyCheckInDates = new Set(dailyCheckInsRes.data?.map(c => c.checkin_date) || []);

      const challengeEntryMap = new Map<string, boolean>();
      challengeEntriesRes.data?.forEach(e => {
        const d = format(new Date(e.created_at), "yyyy-MM-dd");
        if (d >= startDate && d <= endDate) {
          const success = !!e.checkin_response && !e.is_failure;
          challengeEntryMap.set(d, success);
        }
      });

      days.forEach(day => {
        const dateStr = format(day, "yyyy-MM-dd");
        const habitsOnDay = habitsByDate.get(dateStr)?.size || 0;
        
        activityMap.set(dateStr, {
          date: dateStr,
          habitsCompleted: habitsOnDay,
          habitsTotal: totalHabits,
          hasEveningReflection: dailyReflectionDates.has(dateStr),
          hasTasks: taskDates.has(dateStr),
          hasNotToDo: notToDoDates.has(dateStr),
          hasDetoxCheckIn: detoxCheckInDates.has(dateStr),
          detoxSuccess: detoxCheckInDates.has(dateStr),
          hasRecoveryCheckIn: recoveryCheckInMap.has(dateStr),
          recoverySuccess: recoveryCheckInMap.get(dateStr) || false,
          hasDailyCheckIn: dailyCheckInDates.has(dateStr),
          hasChallengeEntry: challengeEntryMap.has(dateStr),
          challengeEntrySuccess: challengeEntryMap.get(dateStr) || false,
        });
      });

      setActivities(activityMap);
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const hasActivityOnDay = (date: Date): boolean => {
    const dateStr = format(date, "yyyy-MM-dd");
    const activity = activities.get(dateStr);
    if (!activity) return false;
    return activity.habitsCompleted > 0 || 
           activity.hasEveningReflection || 
           activity.hasTasks || 
           activity.hasNotToDo || 
           activity.hasDetoxCheckIn || 
           activity.hasRecoveryCheckIn ||
           activity.hasDailyCheckIn ||
           activity.hasChallengeEntry;
  };

  const handleDayClick = (date: Date) => {
    const today = startOfToday();
    if (isBefore(date, today)) {
      setSelectedDate(date);
    }
  };

  return (
    <>
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <Button variant="outline" size="icon" className="h-9 w-9" onClick={goToPreviousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-base font-semibold text-center">
                {format(currentMonth, "LLLL yyyy", { locale: dateLocale })}
              </span>
              <Button variant="outline" size="icon" className="h-9 w-9" onClick={goToNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="h-5 w-5 text-primary" />
                {"Cronologia dei progressi"}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {"Clicca su un giorno per vedere il log"}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <svg className="h-3 w-3 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span className="text-xs text-muted-foreground">{"Fatto"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="h-3 w-3 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                <span className="text-xs text-muted-foreground">{"Non fatto"}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {dayNames.map(day => (
                <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}

              {Array.from({ length: startPadding }).map((_, i) => (
                <div key={`pad-${i}`} className="aspect-square" />
              ))}

              {days.map(day => {
                const isCurrentDay = isToday(day);
                const today = startOfToday();
                const isTodayOrFuture = !isBefore(day, today);
                const dateStr = format(day, "yyyy-MM-dd");
                const hasActivity = hasActivityOnDay(day);

                return (
                  <button
                    key={dateStr}
                    onClick={() => handleDayClick(day)}
                    disabled={isTodayOrFuture}
                    className={cn(
                      "aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-all",
                      "hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-primary/20",
                      isCurrentDay && "ring-2 ring-primary bg-primary/10",
                      isTodayOrFuture && "opacity-30 cursor-not-allowed",
                      hasActivity && !isCurrentDay && "bg-accent/30"
                    )}
                  >
                    <span className={cn(
                      "font-medium",
                      isCurrentDay && "text-primary"
                    )}>
                      {format(day, "d")}
                    </span>
                    {hasActivity && (
                      <div className="w-1 h-1 rounded-full bg-primary/60 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedDate && (
        <DayDetailModal
          date={selectedDate}
          open={!!selectedDate}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </>
  );
}
