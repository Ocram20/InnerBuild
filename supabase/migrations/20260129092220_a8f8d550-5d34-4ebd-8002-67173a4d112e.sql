-- Create ai_insights table for storing AI Coach reports
CREATE TABLE public.ai_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  insight_type TEXT NOT NULL, -- 'habit_adaptation', 'trigger_analysis', 'full_report'
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  detailed_analysis JSONB, -- structured data for habits/triggers
  recommendations TEXT[], -- actionable suggestions
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_read BOOLEAN DEFAULT false
);

-- Enable RLS
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own insights"
ON public.ai_insights
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own insights"
ON public.ai_insights
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert insights"
ON public.ai_insights
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can delete their own insights"
ON public.ai_insights
FOR DELETE
USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX idx_ai_insights_user_created ON public.ai_insights(user_id, created_at DESC);