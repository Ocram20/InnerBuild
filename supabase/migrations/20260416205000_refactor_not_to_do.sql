-- Add is_active column to act as definition
ALTER TABLE public.not_to_do_items ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.not_to_do_items ALTER COLUMN target_date DROP NOT NULL;

-- Create logs table for daily check-ins
CREATE TABLE public.not_to_do_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  not_to_do_id UUID NOT NULL REFERENCES public.not_to_do_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  log_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'avoided', 'broken')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(not_to_do_id, log_date)
);

-- Enable RLS on logs
ALTER TABLE public.not_to_do_logs ENABLE ROW LEVEL SECURITY;

-- Policies for logs
CREATE POLICY "Users can view their own not to do logs" ON public.not_to_do_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own not to do logs" ON public.not_to_do_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own not to do logs" ON public.not_to_do_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own not to do logs" ON public.not_to_do_logs FOR DELETE USING (auth.uid() = user_id);

-- Update trigger
CREATE TRIGGER update_not_to_do_logs_updated_at BEFORE UPDATE ON public.not_to_do_logs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Backfill logs from existing not_to_do_items to preserve history
INSERT INTO public.not_to_do_logs (not_to_do_id, user_id, log_date, status, created_at, updated_at)
SELECT id, user_id, target_date, status, created_at, updated_at
FROM public.not_to_do_items
WHERE target_date IS NOT NULL;
