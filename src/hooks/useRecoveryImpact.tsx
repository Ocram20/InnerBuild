import { useEffect, useMemo, useState } from "react";
import { addDays, format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { untypedTable } from "@/integrations/supabase/untyped-client";

type RecoveryStatus = "success" | "failed";
type RingState = "stable" | "trigger" | "broken";

interface RecoveryCheckInRow {
  checkin_date: string;
  status: RecoveryStatus;
}

interface DailyCheckInRow {
  checkin_date: string;
  energy_level: number | null;
}

interface DailyTaskRow {
  target_date: string;
  title: string;
  is_completed: boolean;
}

export interface RecoveryImpactData {
  cleanDays: number;
  failedDays: number;
  timeRecoveredMinutes: number;
  protectedTasks: number;
  cleanEnergyAvg: number | null;
  relapseEnergyAvg: number | null;
  energyTrendDelta: number | null;
  energyTrendDirection: "up" | "down" | "stable";
  latestEnergy: number | null;
  pendingTaskTitle: string | null;
  projectedRelapseEnergy: number | null;
  projectedResistEnergy: number | null;
  journeySlowdownDays: number;
  ringState: RingState;
}

interface UseRecoveryImpactOptions {
  journeyId?: string | null;
  currentStreak?: number;
  jokersRemaining?: number;
  status?: string | null;
  mode?: "summary" | "trigger" | "relapse";
}

function average(values: number[]) {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function useRecoveryImpact({
  journeyId,
  currentStreak = 0,
  jokersRemaining = 0,
  status,
  mode = "summary",
}: UseRecoveryImpactOptions) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<RecoveryImpactData | null>(null);

  useEffect(() => {
    if (!user || !journeyId) {
      setLoading(false);
      setData(null);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const today = format(new Date(), "yyyy-MM-dd");

        const [{ data: recoveryRows }, { data: dailyCheckins }, { data: dailyTasks }] = await Promise.all([
          supabase
            .from("recovery_checkins")
            .select("checkin_date, status")
            .eq("user_id", user.id)
            .eq("journey_id", journeyId)
            .order("checkin_date", { ascending: true }),
          untypedTable("daily_checkins")
            .select("checkin_date, energy_level")
            .eq("user_id", user.id)
            .order("checkin_date", { ascending: true }),
          supabase
            .from("daily_tasks")
            .select("target_date, title, is_completed")
            .eq("user_id", user.id)
            .order("target_date", { ascending: true }),
        ]);

        if (cancelled) return;

        const recovery = (recoveryRows || []) as RecoveryCheckInRow[];
        const checkins = (dailyCheckins || []) as DailyCheckInRow[];
        const tasks = (dailyTasks || []) as DailyTaskRow[];

        const cleanDates = recovery.filter((row) => row.status === "success").map((row) => row.checkin_date);
        const failedDates = recovery.filter((row) => row.status === "failed").map((row) => row.checkin_date);
        const cleanDateSet = new Set(cleanDates);

        const postRelapseDateSet = new Set<string>();
        failedDates.forEach((dateStr) => {
          const start = new Date(`${dateStr}T00:00:00`);
          for (let offset = 0; offset <= 2; offset += 1) {
            postRelapseDateSet.add(format(addDays(start, offset), "yyyy-MM-dd"));
          }
        });

        const cleanEnergyValues = checkins
          .filter((row) => cleanDateSet.has(row.checkin_date) && typeof row.energy_level === "number")
          .map((row) => Number(row.energy_level));
        const relapseEnergyValues = checkins
          .filter((row) => postRelapseDateSet.has(row.checkin_date) && typeof row.energy_level === "number")
          .map((row) => Number(row.energy_level));

        const cleanEnergyAvg = average(cleanEnergyValues);
        const relapseEnergyAvg = average(relapseEnergyValues);
        const energyTrendDelta =
          cleanEnergyAvg !== null && relapseEnergyAvg !== null ? cleanEnergyAvg - relapseEnergyAvg : null;
        const energyTrendDirection =
          energyTrendDelta === null ? "stable" : energyTrendDelta > 0.35 ? "up" : energyTrendDelta < -0.35 ? "down" : "stable";

        const protectedTasks = tasks.filter((task) => task.is_completed && cleanDateSet.has(task.target_date)).length;
        const pendingTodayTaskTitle =
          tasks.find((task) => task.target_date === today && !task.is_completed)?.title || null;

        const latestEnergy = [...checkins]
          .reverse()
          .find((row) => typeof row.energy_level === "number")?.energy_level ?? null;

        const projectedRelapseEnergy =
          relapseEnergyAvg !== null
            ? Math.max(1, Math.round(relapseEnergyAvg))
            : latestEnergy !== null
              ? Math.max(1, Math.round(latestEnergy - 2))
              : null;

        const projectedResistEnergy =
          cleanEnergyAvg !== null
            ? Math.min(10, Math.round(cleanEnergyAvg))
            : latestEnergy !== null
              ? Math.min(10, Math.round(Math.max(latestEnergy, 6)))
              : null;

        let ringState: RingState = "stable";
        if (mode === "relapse" || status === "paused" || (latestEnergy !== null && latestEnergy <= 3)) {
          ringState = "broken";
        } else if (mode === "trigger" || (latestEnergy !== null && latestEnergy <= 6) || currentStreak === 0) {
          ringState = "trigger";
        }

        setData({
          cleanDays: cleanDates.length,
          failedDays: failedDates.length,
          timeRecoveredMinutes: cleanDates.length * 40,
          protectedTasks,
          cleanEnergyAvg,
          relapseEnergyAvg,
          energyTrendDelta,
          energyTrendDirection,
          latestEnergy,
          pendingTaskTitle: pendingTodayTaskTitle,
          projectedRelapseEnergy,
          projectedResistEnergy,
          journeySlowdownDays: jokersRemaining > 0 ? 1 : 2,
          ringState,
        });
      } catch (error) {
        console.error("Error loading recovery impact:", error);
        if (!cancelled) {
          setData(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [currentStreak, journeyId, jokersRemaining, mode, status, user]);

  const hoursRecovered = useMemo(() => {
    if (!data) return 0;
    return Number((data.timeRecoveredMinutes / 60).toFixed(1));
  }, [data]);

  return { data, loading, hoursRecovered };
}
