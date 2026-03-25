-- Create table for porn recovery challenge tracking
CREATE TABLE public.recovery_journey (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for daily check-ins
CREATE TABLE public.recovery_checkins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  journey_id UUID NOT NULL REFERENCES public.recovery_journey(id) ON DELETE CASCADE,
  checkin_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, journey_id, checkin_date)
);

-- Enable RLS
ALTER TABLE public.recovery_journey ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recovery_checkins ENABLE ROW LEVEL SECURITY;

-- RLS policies for recovery_journey
CREATE POLICY "Users can view their own journey"
  ON public.recovery_journey FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own journey"
  ON public.recovery_journey FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journey"
  ON public.recovery_journey FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own journey"
  ON public.recovery_journey FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for recovery_checkins
CREATE POLICY "Users can view their own checkins"
  ON public.recovery_checkins FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own checkins"
  ON public.recovery_checkins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own checkins"
  ON public.recovery_checkins FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own checkins"
  ON public.recovery_checkins FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_recovery_journey_updated_at
  BEFORE UPDATE ON public.recovery_journey
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();