import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * fetch-cer-bundle: Returns stored CER bundle(s) for given usage event IDs.
 * GET ?eventIds=1,2,3  or POST { eventIds: [1,2,3] }
 * Returns { bundles: { [eventId]: { ... } } }
 */
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'AUTH', message: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'AUTH', message: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse event IDs from query or body
    let eventIds: number[] = [];
    const url = new URL(req.url);
    const queryIds = url.searchParams.get('eventIds');

    if (queryIds) {
      eventIds = queryIds.split(',').map(Number).filter(n => !isNaN(n));
    } else if (req.method === 'POST') {
      const body = await req.json();
      eventIds = (body.eventIds || []).map(Number).filter((n: number) => !isNaN(n));
    }

    if (eventIds.length === 0) {
      return new Response(JSON.stringify({ bundles: {} }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Limit to 50 to prevent abuse
    eventIds = eventIds.slice(0, 50);

    // RLS ensures only user's own bundles are returned
    const { data, error: fetchError } = await supabase
      .from('cer_bundles')
      .select('usage_event_id, certificate_hash, bundle_type, attestation_json, cer_bundle_redacted, created_at')
      .in('usage_event_id', eventIds);

    if (fetchError) {
      console.error('Fetch error:', fetchError);
      return new Response(JSON.stringify({ error: 'DB_FETCH', message: fetchError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Index by event ID
    const bundles: Record<number, unknown> = {};
    for (const row of (data || [])) {
      bundles[row.usage_event_id] = {
        certificateHash: row.certificate_hash,
        bundleType: row.bundle_type,
        attestationJson: row.attestation_json,
        bundle: row.cer_bundle_redacted,
        storedAt: row.created_at,
      };
    }

    return new Response(JSON.stringify({ bundles }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    const error = err as Error;
    console.error('fetch-cer-bundle error:', error.message);
    return new Response(JSON.stringify({ error: 'INTERNAL', message: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
