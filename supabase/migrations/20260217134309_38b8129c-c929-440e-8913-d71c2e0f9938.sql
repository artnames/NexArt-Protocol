
-- Store CER bundles for /api/attest runs
-- Linked to Railway usage_events by usage_event_id (integer)
CREATE TABLE public.cer_bundles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  usage_event_id INTEGER NOT NULL,
  certificate_hash TEXT,
  bundle_type TEXT,
  attestation_json JSONB,
  cer_bundle_redacted JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(usage_event_id)
);

-- Enable RLS
ALTER TABLE public.cer_bundles ENABLE ROW LEVEL SECURITY;

-- Users can only read their own bundles
CREATE POLICY "Users can read own CER bundles"
  ON public.cer_bundles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Edge functions insert via service role, but add policy for completeness
CREATE POLICY "Service role can insert CER bundles"
  ON public.cer_bundles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Index for fast lookup by usage_event_id
CREATE INDEX idx_cer_bundles_usage_event ON public.cer_bundles(usage_event_id);
CREATE INDEX idx_cer_bundles_user ON public.cer_bundles(user_id);
