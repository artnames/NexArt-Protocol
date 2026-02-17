-- Fix: Change RESTRICTIVE policies to PERMISSIVE so user reads/inserts actually work
-- (RESTRICTIVE without any PERMISSIVE policy = always denied)

DROP POLICY IF EXISTS "Service role can insert CER bundles" ON public.cer_bundles;
DROP POLICY IF EXISTS "Users can read own CER bundles" ON public.cer_bundles;

CREATE POLICY "Users can read own CER bundles"
  ON public.cer_bundles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert CER bundles"
  ON public.cer_bundles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
