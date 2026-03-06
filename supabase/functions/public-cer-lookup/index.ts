import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * public-cer-lookup: Public (no auth) endpoint to fetch a CER bundle
 * by executionId or certificateHash for public verification pages.
 *
 * GET ?executionId=xxx  or  GET ?certificateHash=sha256:xxx
 *
 * Returns only the redacted bundle (cer_bundle_redacted) — never raw data.
 */
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const executionId = url.searchParams.get('executionId');
    const certificateHash = url.searchParams.get('certificateHash');

    if (!executionId && !certificateHash) {
      return new Response(JSON.stringify({ error: 'MISSING_PARAM', message: 'Provide executionId or certificateHash' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use service role to bypass RLS — this is intentionally public
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    let query = supabase
      .from('cer_bundles')
      .select('usage_event_id, certificate_hash, bundle_type, attestation_json, cer_bundle_redacted, created_at, app_id, project_id')
      .limit(1);

    if (executionId) {
      // executionId lives inside cer_bundle_redacted->snapshot->executionId
      // We need to use a JSON path filter
      query = query.filter('cer_bundle_redacted->snapshot->>executionId', 'eq', executionId);
    } else if (certificateHash) {
      query = query.eq('certificate_hash', certificateHash);
    }

    const { data, error: fetchError } = await query;

    if (fetchError) {
      console.error('Lookup error:', fetchError);
      return new Response(JSON.stringify({ error: 'DB_FETCH', message: fetchError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!data || data.length === 0) {
      return new Response(JSON.stringify({ error: 'NOT_FOUND', message: 'Record not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const row = data[0];

    // Fetch project and app names if available
    let projectName: string | null = null;
    let appName: string | null = null;

    if (row.project_id) {
      const { data: proj } = await supabase
        .from('projects')
        .select('name')
        .eq('id', row.project_id)
        .single();
      projectName = proj?.name ?? null;
    }

    if (row.app_id) {
      const { data: app } = await supabase
        .from('apps')
        .select('name')
        .eq('id', row.app_id)
        .single();
      appName = app?.name ?? null;
    }

    const bundle = row.cer_bundle_redacted as Record<string, unknown>;

    // Reconstruct a complete bundle for verification
    const result: Record<string, unknown> = {
      ...bundle,
      certificateHash: row.certificate_hash,
      bundleType: row.bundle_type,
    };

    // Attach attestation under meta.attestation if available
    if (row.attestation_json) {
      const existingMeta = (result.meta as Record<string, unknown>) ?? {};
      result.meta = {
        ...existingMeta,
        attestation: row.attestation_json,
      };
    }

    return new Response(JSON.stringify({
      bundle: result,
      certificateHash: row.certificate_hash,
      bundleType: row.bundle_type,
      createdAt: row.created_at,
      projectName,
      appName,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    const error = err as Error;
    console.error('public-cer-lookup error:', error.message);
    return new Response(JSON.stringify({ error: 'INTERNAL', message: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
