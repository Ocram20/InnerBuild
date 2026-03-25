-- Create trigger_logs table for tracking impulses and emotional states
CREATE TABLE public.trigger_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  logged_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  impulse_intensity INTEGER NOT NULL CHECK (impulse_intensity >= 1 AND impulse_intensity <= 10),
  emotion TEXT NOT NULL,
  situation TEXT NOT NULL,
  time_context TEXT NOT NULL, -- morning, afternoon, evening, night
  location_context TEXT, -- home, work, commute, social, etc.
  was_alone BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.trigger_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own trigger logs"
  ON public.trigger_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own trigger logs"
  ON public.trigger_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trigger logs"
  ON public.trigger_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trigger logs"
  ON public.trigger_logs FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger_insights table for AI-generated insights
CREATE TABLE public.trigger_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  insight_type TEXT NOT NULL, -- pattern, suggestion, warning
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  pattern_data JSONB,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.trigger_insights ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own insights"
  ON public.trigger_insights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own insights"
  ON public.trigger_insights FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own insights"
  ON public.trigger_insights FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own insights"
  ON public.trigger_insights FOR DELETE
  USING (auth.uid() = user_id);