/**
 * Helper for tables that exist in the database but are not yet
 * reflected in the auto-generated types.ts.
 *
 * Usage:
 *   import { untypedTable } from "@/integrations/supabase/untyped-client";
 *   const { data } = await untypedTable("my_table").select("*").eq("user_id", uid);
 *
 * This simply bypasses the strict generic so TypeScript won't complain.
 * The runtime behaviour is identical to supabase.from("my_table").
 */
import { supabase } from "./client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function untypedTable(name: string) {
  return (supabase as any).from(name);
}
