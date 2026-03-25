-- Add column to track last username change
ALTER TABLE public.profiles 
ADD COLUMN username_changed_at timestamp with time zone;

-- Remove phone_number column
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS phone_number;