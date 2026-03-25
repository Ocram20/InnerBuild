import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";
import { TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp, Loader2 } from "lucide-react";

interface DayData {
  day: string;
  fullDate: string;
  completed: number;
  total: number;
  percentage: number;
  habits: { title: string; completed: boolean }[];
}

export default function WeeklyProgressChart() {
  const { user } = useAuth();
  const [weekData, setWeekData] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);

  useEffect(() => {
    if (user) {
      fetchWeeklyData();
    }
  }, [user]);

  const fetchWeeklyData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Get the last 7 days
      const dates: string[] = [];
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().split("T")[0]);
      }

      // Fetch all habits
      const { data: habits } = await supabase
        .from("habits")
        .select("id, title")
        .eq("user_id", user.id)
        .eq("is_active", true);

      // Fetch habit logs for the week
      const { data: logs } = await supabase
        .from("habit_logs")
        .select("habit_id, completed_at")
        .eq("user_id", user.id)
        .gte("completed_at", dates[0])
        .lte("completed_at", dates[6]);

      // Build data for each day
      const data: DayData[] = dates.map(date => {
        const dayDate = new Date(date);
        const dayLogs = logs?.filter(l => l.completed_at === date) || [];
        const completedIds = new Set(dayLogs.map(l => l.habit_id));
        
        const habitStatuses = (habits || []).map(h => ({
          title: h.title,
          completed: completedIds.has(h.id),
        }));

        const total = habits?.length || 0;
        const completed = dayLogs.length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        return {
          day: dayNames[dayDate.getDay()],
          fullDate: date,
          completed,
          total,
          percentage,
          habits: habitStatuses,
        };
      });

      setWeekData(data);
    } catch (error) {
      console.error("Error fetching weekly data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate week-over-week change
  const thisWeekAvg = weekData.length > 0 
    ? weekData.reduce((sum, d) => sum + d.percentage, 0) / weekData.length 
    : 0;

  const getTrendIcon = () => {
    if (thisWeekAvg >= 70) return <TrendingUp className="h-4 w-4 text-primary" />;
    if (thisWeekAvg >= 40) return <Minus className="h-4 w-4 text-muted-foreground" />;
    return <TrendingDown className="h-4 w-4 text-destructive" />;
  };

  const getTrendText = () => {
    if (thisWeekAvg >= 70) return "Great progress!";
    if (thisWeekAvg >= 40) return "Steady progress";
    return "Room to grow";
  };

  if (loading) {
    return (
      <div className="glass rounded-2xl p-5 shadow-card">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-4 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">This Week</h3>
        <div className="flex items-center gap-2">
          {getTrendIcon()}
          <span className="text-sm text-muted-foreground">{getTrendText()}</span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-32 mb-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weekData} barCategoryGap="20%">
            <XAxis 
              dataKey="day" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            />
            <YAxis hide domain={[0, 100]} />
            <Bar 
              dataKey="percentage" 
              radius={[6, 6, 0, 0]}
              onClick={(data) => setSelectedDay(data)}
              cursor="pointer"
            >
              {weekData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`}
                  fill={
                    entry.percentage >= 80 
                      ? 'hsl(var(--primary))' 
                      : entry.percentage >= 50 
                        ? 'hsl(var(--primary) / 0.6)' 
                        : 'hsl(var(--muted))'
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Weekly summary */}
      <div className="flex items-center justify-between text-sm mb-3">
        <span className="text-muted-foreground">Weekly average</span>
        <span className="font-semibold text-foreground">{Math.round(thisWeekAvg)}%</span>
      </div>

      {/* Expand toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
      >
        {expanded ? (
          <>
            <ChevronUp className="h-4 w-4" />
            Hide details
          </>
        ) : (
          <>
            <ChevronDown className="h-4 w-4" />
            View details
          </>
        )}
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-border space-y-2 animate-fade-in">
          {weekData.map((day) => (
            <div key={day.fullDate} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground w-10">{day.day}</span>
                <div className="flex gap-1">
                  {day.habits.map((habit, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        habit.completed ? "bg-primary" : "bg-muted"
                      }`}
                      title={`${habit.title}: ${habit.completed ? "Done" : "Missed"}`}
                    />
                  ))}
                </div>
              </div>
              <span className={`text-sm font-medium ${
                day.percentage >= 80 
                  ? "text-primary" 
                  : day.percentage >= 50 
                    ? "text-muted-foreground" 
                    : "text-destructive/70"
              }`}>
                {day.completed}/{day.total}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
