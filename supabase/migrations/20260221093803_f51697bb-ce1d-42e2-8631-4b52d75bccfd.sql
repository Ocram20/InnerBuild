-- Add a persistent counter to profiles that tracks total challenges ever created
ALTER TABLE public.profiles ADD COLUMN total_challenges_created integer NOT NULL DEFAULT 0;

-- Create trigger function to increment counter on challenge insert
CREATE OR REPLACE FUNCTION public.increment_challenge_counter()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET total_challenges_created = total_challenges_created + 1
  WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$$;

-- Attach trigger to detox_challenges table
CREATE TRIGGER on_challenge_created
AFTER INSERT ON public.detox_challenges
FOR EACH ROW
EXECUTE FUNCTION public.increment_challenge_counter();

-- Backfill existing data: count current challenges per user
UPDATE public.profiles p
SET total_challenges_created = sub.cnt
FROM (
  SELECT user_id, COUNT(*) as cnt
  FROM public.detox_challenges
  GROUP BY user_id
) sub
WHERE p.user_id = sub.user_id;