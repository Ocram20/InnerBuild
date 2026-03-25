-- Create table for failure debriefs
CREATE TABLE public.failure_debriefs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  debrief_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Step 1: What happened
  context TEXT,
  mood TEXT,
  trigger TEXT,
  time_of_day TEXT,
  location TEXT,
  was_alone BOOLEAN DEFAULT true,
  
  -- Step 2: First signal ignored
  ignored_signal TEXT,
  signal_details TEXT,
  
  -- Step 3: What to change
  action_plan TEXT,
  ai_suggestions TEXT[],
  
  -- Metadata
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.failure_debriefs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can create their own debriefs"
ON public.failure_debriefs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own debriefs"
ON public.failure_debriefs
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own debriefs"
ON public.failure_debriefs
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own debriefs"
ON public.failure_debriefs
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_failure_debriefs_updated_at
BEFORE UPDATE ON public.failure_debriefs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();