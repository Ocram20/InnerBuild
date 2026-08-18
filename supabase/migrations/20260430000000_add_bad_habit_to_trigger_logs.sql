-- Add bad_habit column to trigger_logs table
ALTER TABLE public.trigger_logs ADD COLUMN IF NOT EXISTS bad_habit TEXT;
