import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import postgres from "https://deno.land/x/postgresjs@v3.4.4/mod.js";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * store-cer-bundle: Persists a redacted CER bundle for a successful /api/attest run.
 * Called after attestation succeeds. Expects JSON body:
 * {
 *   usageEventId: number,
 *   bundle: { bundleType, certificateHash, createdAt, snapshot: {...}, attestation: {...} }
 * }
 *
 * Redaction: snapshot.input, snapshot.output, snapshot.prompt are stripped before storage.
 */

function redactBundle(bundle: Record<string, unknown>): Record<string, unknown> {
  const redacted = JSON.parse(JSON.stringify(bundle));
  if (redacted.snapshot && typeof redacted.snapshot === "object") {
    const snap = redacted.snapshot as Record<string, unknown>;
    delete snap.input;
    delete snap.output;
    delete snap.prompt;
  }
  return redacted;
}

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

    const body = await req.json();
    const { usageEventId, bundle } = body;

    if (!usageEventId || !bundle) {
      return new Response(JSON.stringify({ error: 'VALIDATION', message: 'usageEventId and bundle required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify the usage event belongs to this user via Railway DB
    const databaseUrl = Deno.env.get("DATABASE_URL");
    if (!databaseUrl) {
      throw new Error("CONFIG: DATABASE_URL missing");
    }
    const sql = postgres(databaseUrl, { ssl: false });

    try {
      const rows = await sql`
        SELECT ue.id FROM usage_events ue
        INNER JOIN api_keys ak ON ue.api_key_id = ak.id
        WHERE ue.id = ${usageEventId} AND ak.user_id = ${user.id}::uuid
        LIMIT 1
      `;
      await sql.end();

      if (rows.length === 0) {
        return new Response(JSON.stringify({ error: 'NOT_FOUND', message: 'Event not found or not owned' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } catch (dbErr) {
      await sql.end();
      throw dbErr;
    }

    // Redact sensitive fields
    const redacted = redactBundle(bundle);

    // Use service role to insert into Supabase cer_bundles
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { error: insertError } = await supabaseAdmin
      .from('cer_bundles')
      .upsert({
        user_id: user.id,
        usage_event_id: usageEventId,
        certificate_hash: bundle.certificateHash || null,
        bundle_type: bundle.bundleType || null,
        attestation_json: bundle.attestation || null,
        cer_bundle_redacted: redacted,
      }, { onConflict: 'usage_event_id' });

    if (insertError) {
      console.error('Insert error:', insertError);
      return new Response(JSON.stringify({ error: 'DB_INSERT', message: insertError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    const error = err as Error;
    console.error('store-cer-bundle error:', error.message);
    return new Response(JSON.stringify({ error: 'INTERNAL', message: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
