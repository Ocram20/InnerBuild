-- Add category and participant_count columns to detox_challenges table
ALTER TABLE public.detox_challenges 
ADD COLUMN category text NOT NULL DEFAULT 'general',
ADD COLUMN daily_steps text[] DEFAULT '{}',
ADD COLUMN science_note text;

-- Add a check constraint for valid categories
ALTER TABLE public.detox_challenges 
ADD CONSTRAINT detox_challenges_category_check 
CHECK (category IN ('digital_detox', 'mental_reset', 'porn_detox', 'general'));