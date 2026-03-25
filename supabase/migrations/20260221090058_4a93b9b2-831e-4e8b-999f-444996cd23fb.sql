
-- Table to store AI-generated daily content and user check-in responses for each challenge day
CREATE TABLE public.challenge_daily_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES public.detox_challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  day_number INTEGER NOT NULL,
  phase_name TEXT,
  coach_message TEXT,
  mental_mission TEXT,
  behavioral_mission TEXT,
  mental_mission_completed BOOLEAN DEFAULT false,
  behavioral_mission_completed BOOLEAN DEFAULT false,
  checkin_response TEXT, -- 'tough' | 'manageable' | 'strong'
  is_failure BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(challenge_id, day_number)
);

-- Enable RLS
ALTER TABLE public.challenge_daily_entries ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own daily entries"
  ON public.challenge_daily_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own daily entries"
  ON public.challenge_daily_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily entries"
  ON public.challenge_daily_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily entries"
  ON public.challenge_daily_entries FOR DELETE
  USING (auth.uid() = user_id);

-- Add progress_offset to detox_challenges to track backward movement on failures
ALTER TABLE public.detox_challenges ADD COLUMN progress_offset INTEGER NOT NULL DEFAULT 0;

-- Trigger for updated_at
CREATE TRIGGER update_challenge_daily_entries_updated_at
  BEFORE UPDATE ON public.challenge_daily_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
