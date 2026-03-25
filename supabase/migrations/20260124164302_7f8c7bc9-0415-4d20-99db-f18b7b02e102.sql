-- Create table for tracking habit adaptation suggestions
CREATE TABLE public.habit_adaptations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  
  -- Adaptation details
  adaptation_type TEXT NOT NULL, -- 'timing', 'difficulty', 'frequency', 'alternative'
  original_value TEXT, -- e.g., "08:00" for timing
  suggested_value TEXT NOT NULL, -- e.g., "10:00" for timing
  reason TEXT NOT NULL, -- Explanation for the user
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'dismissed'
  
  -- Pattern data that triggered this
  pattern_data JSONB, -- Stores completion rates, miss patterns, etc.
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create partial unique index for only one pending adaptation per habit
CREATE UNIQUE INDEX idx_habit_adaptations_pending 
ON public.habit_adaptations (habit_id) 
WHERE status = 'pending';

-- Create table for habit performance analytics
CREATE TABLE public.habit_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  
  -- Time-based metrics
  week_start DATE NOT NULL,
  
  -- Completion patterns
  completion_rate NUMERIC(5,2), -- 0-100%
  avg_completion_hour INTEGER, -- 0-23, when they usually complete
  best_day_of_week INTEGER, -- 0-6 (Sunday-Saturday)
  worst_day_of_week INTEGER,
  
  -- Streak data
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_completions INTEGER DEFAULT 0,
  total_misses INTEGER DEFAULT 0,
  
  -- Pattern flags
  morning_person BOOLEAN, -- tends to complete before noon
  evening_person BOOLEAN, -- tends to complete after 6pm
  weekend_struggler BOOLEAN, -- lower completion on weekends
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(habit_id, week_start)
);

-- Enable RLS
ALTER TABLE public.habit_adaptations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_analytics ENABLE ROW LEVEL SECURITY;

-- RLS policies for habit_adaptations
CREATE POLICY "Users can view their own adaptations"
ON public.habit_adaptations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own adaptations"
ON public.habit_adaptations FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own adaptations"
ON public.habit_adaptations FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own adaptations"
ON public.habit_adaptations FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for habit_analytics
CREATE POLICY "Users can view their own analytics"
ON public.habit_analytics FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analytics"
ON public.habit_analytics FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analytics"
ON public.habit_analytics FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analytics"
ON public.habit_analytics FOR DELETE
USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_habit_adaptations_updated_at
BEFORE UPDATE ON public.habit_adaptations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_habit_analytics_updated_at
BEFORE UPDATE ON public.habit_analytics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();