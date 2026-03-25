
-- Add joker system and check-in based progression to recovery_journey
ALTER TABLE public.recovery_journey 
  ADD COLUMN IF NOT EXISTS jokers_remaining integer NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS current_streak integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS longest_streak integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_check_in date DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';
