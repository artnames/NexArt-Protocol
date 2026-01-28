import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import postgres from "https://deno.land/x/postgresjs@v3.4.4/mod.js";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function getDbConnection() {
  const databaseUrl = Deno.env.get("DATABASE_URL");
  
  if (!databaseUrl) {
    throw new Error("CONFIG: DATABASE_URL missing");
  }

  return postgres(databaseUrl, { 
    ssl: false,
    connection: {
      application_name: 'nexart-usage-recent'
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
    const sql = getDbConnection();

    try {
      // Get recent usage events for user's keys
      // Note: Railway schema uses 'ts' not 'created_at', 'error' not 'error_code'
      const events = await sql`
        SELECT 
          ue.id,
          ue.ts as created_at,
          ue.endpoint,
          ue.status_code,
          ue.duration_ms,
          ue.error as error_code,
          ak.label as key_label
        FROM usage_events ue
        INNER JOIN api_keys ak ON ue.api_key_id = ak.id
        WHERE ak.user_id = ${userId}::uuid
        ORDER BY ue.ts DESC
        LIMIT 50
      `;

      await sql.end();

      console.log(`Listed ${events.length} recent events for user ${userId}`);

      return new Response(JSON.stringify({ events }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (dbError) {
      await sql.end();
      throw dbError;
    }

  } catch (err) {
    const error = err as Error;
    console.error('Error getting recent usage:', error.message);
    
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
