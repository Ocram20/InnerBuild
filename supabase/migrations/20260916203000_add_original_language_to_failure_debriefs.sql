-- Add original_language column to failure_debriefs table if it does not exist
ALTER TABLE public.failure_debriefs ADD COLUMN IF NOT EXISTS original_language TEXT;
UPDATE public.failure_debriefs SET original_language = 'it' WHERE original_language IS NULL;
