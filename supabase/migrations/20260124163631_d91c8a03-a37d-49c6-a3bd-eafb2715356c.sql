-- Create table for wearable health data (mock + future real integrations)
CREATE TABLE public.wearable_health_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Sleep metrics
  sleep_hours NUMERIC(4,2),
  sleep_quality INTEGER CHECK (sleep_quality >= 0 AND sleep_quality <= 100),
  
  -- Activity metrics
  steps INTEGER,
  active_minutes INTEGER,
  calories_burned INTEGER,
  
  -- Stress & recovery
  stress_level INTEGER CHECK (stress_level >= 0 AND stress_level <= 100),
  recovery_score INTEGER CHECK (recovery_score >= 0 AND recovery_score <= 100),
  heart_rate_avg INTEGER,
  hrv_avg INTEGER,
  
  -- Source tracking
  source TEXT DEFAULT 'mock', -- mock, fitbit, google_fit, oura, apple_health
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(user_id, date)
);

-- Create table for AI health suggestions
CREATE TABLE public.health_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Suggestion content
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL, -- sleep, stress, activity, general
  urgency TEXT NOT NULL DEFAULT 'ok', -- ok, moderate, critical
  
  -- Action tracking
  status TEXT NOT NULL DEFAULT 'pending', -- pending, done, skipped, modified
  modified_note TEXT, -- if user modified the suggestion
  
  -- AI metadata
  based_on JSONB, -- what metrics triggered this suggestion
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.wearable_health_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_suggestions ENABLE ROW LEVEL SECURITY;

-- RLS policies for wearable_health_data
CREATE POLICY "Users can view their own health data"
ON public.wearable_health_data FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own health data"
ON public.wearable_health_data FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own health data"
ON public.wearable_health_data FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own health data"
ON public.wearable_health_data FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for health_suggestions
CREATE POLICY "Users can view their own suggestions"
ON public.health_suggestions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own suggestions"
ON public.health_suggestions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own suggestions"
ON public.health_suggestions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own suggestions"
ON public.health_suggestions FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_wearable_health_data_updated_at
BEFORE UPDATE ON public.wearable_health_data
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_health_suggestions_updated_at
BEFORE UPDATE ON public.health_suggestions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();