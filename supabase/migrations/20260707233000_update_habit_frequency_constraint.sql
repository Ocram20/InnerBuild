-- Drop existing frequency constraint on habits table if it exists
ALTER TABLE public.habits DROP CONSTRAINT IF EXISTS habits_frequency_check;

-- Recreate frequency check constraint supporting 'daily', 'weekly', 'custom', 'weekdays', and 'weekends'
ALTER TABLE public.habits ADD CONSTRAINT habits_frequency_check 
  CHECK (frequency IN ('daily', 'weekly', 'custom', 'weekdays', 'weekends'));
