/**
 * passwordHistory.ts
 *
 * Utilities for storing and checking a user's past password hashes.
 * Uses bcryptjs so that we never store plain-text passwords.
 *
 * Strategy:
 *  - We keep the last MAX_HISTORY passwords per user.
 *  - On every successful password change we:
 *      1. Check the new password against all stored hashes.
 *      2. If it is NOT a previously-used password, we allow the change.
 *      3. After the change we hash & store the new password and prune old entries.
 */

import { hash, compare } from "bcryptjs";
import { supabase } from "@/integrations/supabase/client";

const SALT_ROUNDS = 10;
const MAX_HISTORY = 10; // how many past passwords to remember

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface PasswordHistoryRow {
  id: string;
  password_hash: string;
  created_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns true if `plainPassword` matches any previously-stored hash for
 * this user (i.e. the password has already been used).
 */
export async function isPasswordAlreadyUsed(
  userId: string,
  plainPassword: string
): Promise<boolean> {
  try {
    const { data, error } = await (supabase as any)
      .from("password_history")
      .select("id, password_hash, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(MAX_HISTORY);

    if (error || !data || data.length === 0) return false;

    // compare handles the per-hash salt automatically
    for (const row of data as PasswordHistoryRow[]) {
      const match = await compare(plainPassword, row.password_hash);
      if (match) return true;
    }

    return false;
  } catch (err) {
    // If the table doesn't exist yet or any network error: fail open
    console.error("passwordHistory: check error", err);
    return false;
  }
}

/**
 * Hash `plainPassword` and persist it in `password_history`.
 * Automatically prunes entries older than MAX_HISTORY.
 *
 * Call this AFTER a successful supabase.auth.updateUser({ password }) call.
 */
export async function storePasswordHash(
  userId: string,
  plainPassword: string
): Promise<void> {
  try {
    const passwordHash = await hash(plainPassword, SALT_ROUNDS);

    const { error: insertError } = await (supabase as any)
      .from("password_history")
      .insert({ user_id: userId, password_hash: passwordHash });

    if (insertError) {
      console.error("passwordHistory: insert error", insertError);
      return;
    }

    // Prune: keep only the most-recent MAX_HISTORY entries
    const { data: allRows, error: fetchError } = await (supabase as any)
      .from("password_history")
      .select("id, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (fetchError || !allRows) return;

    if (allRows.length > MAX_HISTORY) {
      const toDelete = (allRows as { id: string; created_at: string }[])
        .slice(MAX_HISTORY)
        .map((r) => r.id);

      await (supabase as any)
        .from("password_history")
        .delete()
        .in("id", toDelete)
        .eq("user_id", userId);
    }
  } catch (err) {
    console.error("passwordHistory: store error", err);
  }
}
