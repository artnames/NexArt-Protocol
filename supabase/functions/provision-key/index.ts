import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import postgres from "https://deno.land/x/postgresjs@v3.4.4/mod.js";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function getPlanLimits(plan: string): number {
  const limits: Record<string, number> = {
    free: 100,
    pro: 10000,
    team: 100000,
    enterprise: 1000000,
  };
  return limits[plan] || 100;
}

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
    const plan = body.plan || 'free';
    const label = body.label || 'Default Key';

    if (!['free', 'pro', 'team', 'enterprise'].includes(plan)) {
      return new Response(JSON.stringify({ error: 'Invalid plan' }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Generate and hash the API key
    const apiKey = generateApiKey();
    const keyHash = await hashApiKey(apiKey);
    const monthlyLimit = getPlanLimits(plan);

    // Connect to Railway Postgres
    const databaseUrl = Deno.env.get("DATABASE_URL");
    if (!databaseUrl) {
      throw new Error("DATABASE_URL not configured");
    }
    
    const sql = postgres(databaseUrl, { ssl: 'require' });

    // Rate limit: max 10 keys per user
    const existingKeys = await sql`
      SELECT COUNT(*)::int as count FROM api_keys WHERE user_id = ${userId}::uuid
    `;
    
    if (existingKeys[0].count >= 10) {
      await sql.end();
      return new Response(JSON.stringify({ error: 'Maximum of 10 API keys allowed per user' }), { 
        status: 429, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Insert into api_keys table
    const result = await sql`
      INSERT INTO api_keys (key_hash, label, plan, status, monthly_limit, user_id, created_at)
      VALUES (${keyHash}, ${label}, ${plan}, 'active', ${monthlyLimit}, ${userId}::uuid, NOW())
      RETURNING id
    `;

    await sql.end();

    console.log(`Provisioned key for user ${userId}, plan: ${plan}`);

    return new Response(JSON.stringify({
      apiKey,
      apiKeyId: result[0].id,
      monthlyLimit,
      plan,
      label
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    const error = err as Error;
    console.error('Error provisioning key:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
