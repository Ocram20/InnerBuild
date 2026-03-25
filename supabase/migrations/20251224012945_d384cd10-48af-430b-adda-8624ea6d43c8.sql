-- Add category column to habits table
ALTER TABLE public.habits 
ADD COLUMN category text NOT NULL DEFAULT 'general';

-- Add a check constraint for valid categories
ALTER TABLE public.habits 
ADD CONSTRAINT habits_category_check 
CHECK (category IN ('health', 'productivity', 'mindfulness', 'fitness', 'learning', 'social', 'creativity', 'general'));