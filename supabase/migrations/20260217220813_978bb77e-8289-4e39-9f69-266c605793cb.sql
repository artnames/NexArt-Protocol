
-- Add artifact columns to cer_bundles
ALTER TABLE public.cer_bundles
  ADD COLUMN IF NOT EXISTS artifact_path text,
  ADD COLUMN IF NOT EXISTS artifact_mime text;

-- Create storage bucket for certified artifacts
INSERT INTO storage.buckets (id, name, public)
VALUES ('certified-artifacts', 'certified-artifacts', false)
ON CONFLICT (id) DO NOTHING;

-- RLS: service role inserts (edge function uses service role)
CREATE POLICY "Service role can manage certified artifacts"
ON storage.objects
FOR ALL
USING (bucket_id = 'certified-artifacts')
WITH CHECK (bucket_id = 'certified-artifacts');

-- RLS: authenticated users can read their own artifacts (path starts with user/{userId}/)
CREATE POLICY "Users can read own certified artifacts"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'certified-artifacts'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
