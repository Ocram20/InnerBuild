-- Migration: Password History
-- Stores bcrypt hashes of past passwords so users cannot reuse them.

CREATE TABLE IF NOT EXISTS public.password_history (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  password_hash text      NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Index for fast per-user lookups
CREATE INDEX IF NOT EXISTS idx_password_history_user_id
  ON public.password_history (user_id, created_at DESC);

ALTER TABLE public.password_history ENABLE ROW LEVEL SECURITY;

-- Users can read their own history (needed by the client-side bcrypt check)
CREATE POLICY "Users can view own password history"
  ON public.password_history FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can insert their own new hash entries
CREATE POLICY "Users can insert own password history"
  ON public.password_history FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own entries (used to prune old records)
CREATE POLICY "Users can delete own password history"
  ON public.password_history FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
