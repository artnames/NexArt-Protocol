import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import postgres from "https://deno.land/x/postgresjs@v3.4.4/mod.js";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function generateApiKey(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  return `nx_live_${hex}`;
}

async function hashApiKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const userId = user.id;
    const body = await req.json();
    const keyId = body.keyId;

    if (!keyId) {
      return new Response(JSON.stringify({ error: 'keyId is required' }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Connect to Railway Postgres
    const databaseUrl = Deno.env.get("DATABASE_URL");
    if (!databaseUrl) {
      throw new Error("DATABASE_URL not configured");
    }
    
    const sql = postgres(databaseUrl, { ssl: 'require' });

    // Verify ownership and get old key details
    const oldKey = await sql`
      SELECT id, plan, label, monthly_limit
      FROM api_keys 
      WHERE id = ${keyId} AND user_id = ${userId}::uuid AND status = 'active'
    `;

    if (oldKey.length === 0) {
      await sql.end();
      return new Response(JSON.stringify({ error: 'Key not found or already revoked' }), { 
        status: 404, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Revoke old key
    await sql`
      UPDATE api_keys 
      SET status = 'revoked', revoked_at = NOW()
      WHERE id = ${keyId}
    `;

    // Generate new key
    const apiKey = generateApiKey();
    const keyHash = await hashApiKey(apiKey);

    // Create new key with same settings
    const result = await sql`
      INSERT INTO api_keys (key_hash, label, plan, status, monthly_limit, user_id, created_at)
      VALUES (${keyHash}, ${oldKey[0].label}, ${oldKey[0].plan}, 'active', ${oldKey[0].monthly_limit}, ${userId}::uuid, NOW())
      RETURNING id
    `;

    await sql.end();

    console.log(`Rotated key ${keyId} for user ${userId}`);

    return new Response(JSON.stringify({
      apiKey,
      apiKeyId: result[0].id,
      monthlyLimit: oldKey[0].monthly_limit,
      plan: oldKey[0].plan,
      label: oldKey[0].label
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    const error = err as Error;
    console.error('Error rotating key:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
