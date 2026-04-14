import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

/**
 * Keeps daily-planning data intact for historical calendar/activity views.
 * We intentionally avoid hard-deleting past rows so users can still review
 * completed vs missed tasks in previous days.
 */
export async function cleanupExpiredDailyPlanningItems(userId?: string) {
  if (!userId) return;

  // Run a lightweight query to keep a valid async flow/caller contract.
  // (No-op cleanup by design; UI hides non-current planning dates.)
  const todayISO = format(new Date(), "yyyy-MM-dd");
  await supabase
    .from("daily_tasks")
    .select("id")
    .eq("user_id", userId)
    .lt("target_date", todayISO)
    .limit(1);
}
