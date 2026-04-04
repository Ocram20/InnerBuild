import { addDays, endOfDay, format, parseISO } from "date-fns";

/**
 * Whether a habit should appear in the activity log for a calendar day.
 * New habits (created after that day) are excluded. Archived habits still
 * appear on days before they were turned off (uses updated_at as proxy).
 */
export function habitWasTrackedOnDate(
  habit: { created_at: string; is_active: boolean; updated_at: string },
  day: Date
): boolean {
  const dateStr = format(day, "yyyy-MM-dd");
  if (parseISO(habit.created_at) > endOfDay(day)) return false;
  if (habit.is_active) return true;
  const updatedStr = format(parseISO(habit.updated_at), "yyyy-MM-dd");
  return updatedStr >= dateStr;
}

/**
 * Whether a detox challenge was running on this calendar day (by start + duration).
 */
export function detoxChallengeAppliesOnDateStr(
  c: { start_date: string; duration_days: number; status: string },
  dateStr: string
): boolean {
  if (c.start_date > dateStr) return false;
  const startIso = c.start_date.length <= 10 ? `${c.start_date}T12:00:00` : c.start_date;
  const start = parseISO(startIso);
  const endStr = format(addDays(start, Math.max(0, c.duration_days - 1)), "yyyy-MM-dd");
  if (dateStr > endStr) return false;
  const s = (c.status || "").toLowerCase();
  if (s === "cancelled" || s === "abandoned") return false;
  return true;
}
