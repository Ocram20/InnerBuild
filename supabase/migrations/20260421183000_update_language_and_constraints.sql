
-- 1. Update detox_challenges check constraint for duration_days
ALTER TABLE public.detox_challenges DROP CONSTRAINT IF EXISTS detox_challenges_duration_days_check;
ALTER TABLE public.detox_challenges ADD CONSTRAINT detox_challenges_duration_days_check CHECK (duration_days IN (3, 7, 14, 21, 30, 90));

-- 2. Add original_language column to various tables
ALTER TABLE public.habits ADD COLUMN IF NOT EXISTS original_language TEXT;
ALTER TABLE public.daily_reflections ADD COLUMN IF NOT EXISTS original_language TEXT;
ALTER TABLE public.daily_checkins ADD COLUMN IF NOT EXISTS original_language TEXT;
ALTER TABLE public.trigger_logs ADD COLUMN IF NOT EXISTS original_language TEXT;
ALTER TABLE public.not_to_do_items ADD COLUMN IF NOT EXISTS original_language TEXT;
ALTER TABLE public.daily_tasks ADD COLUMN IF NOT EXISTS original_language TEXT;

-- 3. Backfill existing records to 'it' (assuming current users are mostly Italian based on context)
-- In a real production app, we might use a language detection library for backfilling,
-- but for this migration 'it' is a safe default given the user's request.
UPDATE public.habits SET original_language = 'it' WHERE original_language IS NULL;
UPDATE public.daily_reflections SET original_language = 'it' WHERE original_language IS NULL;
UPDATE public.daily_checkins SET original_language = 'it' WHERE original_language IS NULL;
UPDATE public.trigger_logs SET original_language = 'it' WHERE original_language IS NULL;
UPDATE public.not_to_do_items SET original_language = 'it' WHERE original_language IS NULL;
UPDATE public.daily_tasks SET original_language = 'it' WHERE original_language IS NULL;
