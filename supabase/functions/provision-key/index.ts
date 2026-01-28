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

function getDbConnection() {
  const databaseUrl = Deno.env.get("DATABASE_URL");
  
  if (!databaseUrl) {
    throw new Error("CONFIG: DATABASE_URL missing");
  }

  // Parse the URL to extract host for logging (no credentials)
  try {
    const url = new URL(databaseUrl);
    console.log(`DB config: host=${url.hostname}, port=${url.port || 5432}, hasPassword=${!!url.password}`);
  } catch {
    console.log("DB config: URL present but not parseable as URL");
  }

  // Railway proxy doesn't require SSL for connections
  return postgres(databaseUrl, { 
    ssl: false,
    connection: {
      application_name: 'nexart-provision-key'
    }
  });
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Health check endpoint
  const url = new URL(req.url);
  if (url.pathname.endsWith('/health') || url.searchParams.get('health') === '1') {
    try {
      const sql = getDbConnection();
      const result = await sql`SELECT 1 as ok`;
      await sql.end();
      return new Response(JSON.stringify({ 
        status: 'healthy', 
        db: 'connected',
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (err) {
      const error = err as Error;
      return new Response(JSON.stringify({ 
        status: 'unhealthy', 
        error: 'DB_CONNECTION',
        message: error.message,
        timestamp: new Date().toISOString()
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  try {
    // Validate auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ 
        error: 'AUTH', 
        message: 'Missing or invalid Authorization header' 
      }), { 
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
      return new Response(JSON.stringify({ 
        error: 'AUTH', 
        message: 'Invalid or expired token',
        details: userError?.message 
      }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const userId = user.id;
    
    // Parse request body
    let body: { plan?: string; label?: string } = {};
    try {
      body = await req.json();
    } catch {
      // Empty body is ok, use defaults
    }
    
    const plan = body.plan || 'free';
    const label = body.label || 'Default Key';

    if (!['free', 'pro', 'team', 'enterprise'].includes(plan)) {
      return new Response(JSON.stringify({ 
        error: 'VALIDATION', 
        message: 'Invalid plan. Must be: free, pro, team, or enterprise' 
      }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Generate and hash the API key
    const apiKey = generateApiKey();
    const keyHash = await hashApiKey(apiKey);
    const monthlyLimit = getPlanLimits(plan);

    // Connect to Railway Postgres
    console.log(`Attempting DB connection for user ${userId}`);
    const sql = getDbConnection();

    try {
      // Rate limit: max 10 keys per user
      const existingKeys = await sql`
        SELECT COUNT(*)::int as count FROM api_keys WHERE user_id = ${userId}::uuid
      `;
      
      if (existingKeys[0].count >= 10) {
        await sql.end();
        return new Response(JSON.stringify({ 
          error: 'RATE_LIMIT', 
          message: 'Maximum of 10 API keys allowed per user' 
        }), { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }

      // Insert into api_keys table (matches Railway schema)
      const result = await sql`
        INSERT INTO api_keys (user_id, key_hash, label, plan, status, monthly_limit, created_at)
        VALUES (${userId}::uuid, ${keyHash}, ${label}, ${plan}, 'active', ${monthlyLimit}, NOW())
        RETURNING id
      `;

      // Insert audit event for key creation
      try {
        await sql`
          INSERT INTO usage_events (api_key_id, endpoint, status_code, duration_ms, ts)
          VALUES (${result[0].id}, 'audit:key_created', 200, 0, NOW())
        `;
      } catch (auditError) {
        // Log but don't fail if audit insert fails
        console.warn('Failed to insert audit event:', auditError);
      }

      await sql.end();

      console.log(`Provisioned key for user ${userId}, plan: ${plan}, keyId: ${result[0].id}`);

      // Return plaintext key ONCE - it's never stored
      return new Response(JSON.stringify({
        apiKey,
        apiKeyId: result[0].id,
        monthlyLimit,
        plan,
        label
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (dbError) {
      await sql.end();
      throw dbError;
    }

  } catch (err) {
    const error = err as Error;
    console.error('Error provisioning key:', error.message);
    console.error('Stack:', error.stack);
    
    // Determine error type
    let errorCode = 'INTERNAL';
    if (error.message.includes('CONFIG')) {
      errorCode = 'CONFIG';
    } else if (error.message.includes('SSL') || error.message.includes('TLS') || error.message.includes('certificate')) {
      errorCode = 'DB_SSL';
    } else if (error.message.includes('connect') || error.message.includes('ECONNREFUSED')) {
      errorCode = 'DB_CONNECTION';
    }
    
    return new Response(JSON.stringify({ 
      error: errorCode, 
      message: error.message,
      details: error.stack?.split('\n').slice(0, 5).join('\n')
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
