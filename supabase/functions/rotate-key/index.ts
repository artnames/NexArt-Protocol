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

function getDbConnection() {
  const databaseUrl = Deno.env.get("DATABASE_URL");
  
  if (!databaseUrl) {
    throw new Error("CONFIG: DATABASE_URL missing");
  }

  return postgres(databaseUrl, { 
    ssl: false,
    connection: {
      application_name: 'nexart-rotate-key'
    }
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'AUTH', message: 'Unauthorized' }), { 
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
      return new Response(JSON.stringify({ error: 'AUTH', message: 'Unauthorized' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const userId = user.id;
    
    let body: { keyId?: string } = {};
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: 'VALIDATION', message: 'Invalid JSON body' }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }
    
    const keyId = body.keyId;

    if (!keyId) {
      return new Response(JSON.stringify({ error: 'VALIDATION', message: 'keyId is required' }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const sql = getDbConnection();

    try {
      // Verify ownership and get old key details
      const oldKey = await sql`
        SELECT id, plan, label, monthly_limit
        FROM api_keys 
        WHERE id = ${keyId}::int AND user_id = ${userId}::uuid AND status = 'active'
      `;

      if (oldKey.length === 0) {
        await sql.end();
        return new Response(JSON.stringify({ error: 'NOT_FOUND', message: 'Key not found or already revoked' }), { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }

      // Revoke old key
      await sql`
        UPDATE api_keys 
        SET status = 'revoked'
        WHERE id = ${keyId}::int
      `;

      // Insert audit event for old key revocation
      try {
        await sql`
          INSERT INTO usage_events (api_key_id, endpoint, status_code, duration_ms, ts)
          VALUES (${keyId}::int, 'audit:key_rotated_old', 200, 0, NOW())
        `;
      } catch (auditError) {
        console.warn('Failed to insert audit event for old key:', auditError);
      }

      // Generate new key
      const apiKey = generateApiKey();
      const keyHash = await hashApiKey(apiKey);

      // Create new key with same settings
      const result = await sql`
        INSERT INTO api_keys (key_hash, label, plan, status, monthly_limit, user_id, created_at)
        VALUES (${keyHash}, ${oldKey[0].label}, ${oldKey[0].plan}, 'active', ${oldKey[0].monthly_limit}, ${userId}::uuid, NOW())
        RETURNING id
      `;

      // Insert audit event for new key creation
      try {
        await sql`
          INSERT INTO usage_events (api_key_id, endpoint, status_code, duration_ms, ts)
          VALUES (${result[0].id}, 'audit:key_rotated_new', 200, 0, NOW())
        `;
      } catch (auditError) {
        console.warn('Failed to insert audit event for new key:', auditError);
      }

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

    } catch (dbError) {
      await sql.end();
      throw dbError;
    }

  } catch (err) {
    const error = err as Error;
    console.error('Error rotating key:', error.message);
    
    let errorCode = 'INTERNAL';
    if (error.message.includes('CONFIG')) errorCode = 'CONFIG';
    else if (error.message.includes('SSL') || error.message.includes('certificate')) errorCode = 'DB_SSL';
    
    return new Response(JSON.stringify({ 
      error: errorCode, 
      message: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
