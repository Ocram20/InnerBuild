-- Drop the overly permissive INSERT policy
DROP POLICY IF EXISTS "Service role can insert insights" ON public.ai_insights;

-- The edge function will use service_role key which bypasses RLS
-- So we don't need a permissive INSERT policy