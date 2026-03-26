
-- 1. Add total_challenges_created column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_challenges_created integer NOT NULL DEFAULT 0;

-- 2. Create challenge_daily_entries table
CREATE TABLE IF NOT EXISTS public.challenge_daily_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES public.detox_challenges(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_number integer NOT NULL,
  phase_name text,
  coach_message text,
  mental_mission text,
  behavioral_mission text,
  mental_mission_completed boolean NOT NULL DEFAULT false,
  behavioral_mission_completed boolean NOT NULL DEFAULT false,
  checkin_response text,
  is_failure boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(challenge_id, day_number)
);

ALTER TABLE public.challenge_daily_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own challenge entries"
  ON public.challenge_daily_entries FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own challenge entries"
  ON public.challenge_daily_entries FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own challenge entries"
  ON public.challenge_daily_entries FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Service role needs full access for edge functions
CREATE POLICY "Service role full access to challenge entries"
  ON public.challenge_daily_entries FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 3. Create ai_insights table
CREATE TABLE IF NOT EXISTS public.ai_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  insight_type text NOT NULL,
  title text NOT NULL DEFAULT '',
  summary text NOT NULL DEFAULT '',
  detailed_analysis jsonb DEFAULT '{}'::jsonb,
  recommendations text[] DEFAULT '{}',
  period_start text,
  period_end text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own insights"
  ON public.ai_insights FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own insights"
  ON public.ai_insights FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own insights"
  ON public.ai_insights FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service role full access to insights"
  ON public.ai_insights FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
