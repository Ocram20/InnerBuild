import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

/**
 * Deletes expired daily-planning items (target_date before today).
 * Keeps today's and tomorrow's plans untouched.
 */
export async function cleanupExpiredDailyPlanningItems(userId?: string) {
  if (!userId) return;

  // Use LOCAL day (not UTC) to avoid deleting "today" items late at night.
  const todayISO = format(new Date(), "yyyy-MM-dd");

  await Promise.all([
    supabase
      .from("daily_tasks")
      .delete()
      .eq("user_id", userId)
      .lt("target_date", todayISO),
    supabase
      .from("not_to_do_items")
      .delete()
      .eq("user_id", userId)
      .lt("target_date", todayISO),
  ]);
}
