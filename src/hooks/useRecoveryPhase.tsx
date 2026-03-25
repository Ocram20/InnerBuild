import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";


export interface RecoveryPhase {
  id: string;
  name: string;
  description: string;
  minDays: number;
  maxDays: number;
  color: string;
  icon: string;
}

export const RECOVERY_PHASES: RecoveryPhase[] = [
  {
    id: "acute",
    name: "Acute Phase",
    description: "The hardest stretch — your brain is adjusting to life without the super-stimulus. Withdrawal symptoms are normal and temporary.",
    minDays: 0,
    maxDays: 14,
    color: "hsl(0, 65%, 55%)",
    icon: "🔥",
  },
  {
    id: "stabilization",
    name: "Stabilization",
    description: "Cravings become less intense. Your brain's dopamine baseline is slowly normalizing. Building new routines is key here.",
    minDays: 15,
    maxDays: 45,
    color: "hsl(35, 85%, 55%)",
    icon: "🛡️",
  },
  {
    id: "reconstruction",
    name: "Reconstruction",
    description: "Neural pathways are rewiring. Emotional regulation improves. You're building the person you want to become.",
    minDays: 46,
    maxDays: 90,
    color: "hsl(152, 55%, 45%)",
    icon: "✨",
  },
  {
    id: "consolidation",
    name: "Consolidation",
    description: "New habits feel natural. Your brain has significantly healed. Vigilance is still important, but you have strong foundations.",
    minDays: 91,
    maxDays: 999,
    color: "hsl(250, 60%, 60%)",
    icon: "👑",
  },
];

export interface PhaseProgress {
  currentPhase: RecoveryPhase;
  phaseIndex: number;
  effectiveDays: number;
  progressInPhase: number; // 0–1
  totalProgress: number; // 0–1 across all phases (capped at consolidation start)
  successCount: number;
  failureCount: number;
  reflectionCount: number;
  debriefCount: number;
  recentConsecutiveFailures: number;
}

export function useRecoveryPhase(journeyStartedAt: string | null, journeyId: string | null) {
  const { user } = useAuth();
  const [phaseProgress, setPhaseProgress] = useState<PhaseProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !journeyStartedAt || !journeyId) {
      setLoading(false);
      return;
    }
    computePhase();
  }, [user, journeyStartedAt, journeyId]);

  const computePhase = async () => {
    if (!user || !journeyStartedAt || !journeyId) return;

    try {
      // Fetch check-ins for THIS journey + completed debriefs
      const [checkInsRes, debriefsRes] = await Promise.all([
        supabase
          .from("recovery_checkins")
          .select("status, checkin_date")
          .eq("user_id", user.id)
          .eq("journey_id", journeyId)
          .order("checkin_date", { ascending: false }),
        supabase
          .from("failure_debriefs")
          .select("id, is_completed")
          .eq("user_id", user.id)
          .eq("is_completed", true),
      ]);

      const checkIns = checkInsRes.data || [];
      const debriefs = debriefsRes.data || [];

      const successCount = checkIns.filter(c => c.status === "success").length;
      const failureCount = checkIns.filter(c => c.status === "failed").length;
      const debriefCount = debriefs.length;

      // Count recent consecutive failures (for AI prompt context)
      let recentConsecutiveFailures = 0;
      for (const ci of checkIns) {
        if (ci.status === "failed") recentConsecutiveFailures++;
        else break;
      }

      // Effective days formula:
      // Based on actual check-ins, not calendar days
      // successCount - (failures * 2) + (debriefs * 1)
      const penalty = failureCount * 2;
      const debriefRecovery = debriefCount * 1;

      const effectiveDays = Math.max(0, successCount - penalty + debriefRecovery);

      // Determine phase
      let phaseIndex = 0;
      for (let i = RECOVERY_PHASES.length - 1; i >= 0; i--) {
        if (effectiveDays >= RECOVERY_PHASES[i].minDays) {
          phaseIndex = i;
          break;
        }
      }

      const phase = RECOVERY_PHASES[phaseIndex];
      const phaseDuration = phase.maxDays - phase.minDays + 1;
      const daysInPhase = effectiveDays - phase.minDays;
      const progressInPhase = Math.min(1, Math.max(0, daysInPhase / phaseDuration));
      const totalProgress = Math.min(1, effectiveDays / 90);

      setPhaseProgress({
        currentPhase: phase,
        phaseIndex,
        effectiveDays,
        progressInPhase,
        totalProgress,
        successCount,
        failureCount,
        reflectionCount: 0, // not used separately anymore
        debriefCount,
        recentConsecutiveFailures,
      });
    } catch (error) {
      console.error("Error computing recovery phase:", error);
    } finally {
      setLoading(false);
    }
  };

  return { phaseProgress, loading, refetch: computePhase };
}
