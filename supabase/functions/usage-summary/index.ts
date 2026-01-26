import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import postgres from "https://deno.land/x/postgresjs@v3.4.4/mod.js";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    const url = new URL(req.url);
    const period = url.searchParams.get('period') || 'month';

    // Connect to Railway Postgres
    const databaseUrl = Deno.env.get("DATABASE_URL");
    if (!databaseUrl) {
      throw new Error("DATABASE_URL not configured");
    }
    
    const sql = postgres(databaseUrl, { ssl: { rejectUnauthorized: false } });

    // Query usage stats for user's keys
    let stats;
    if (period === 'today') {
      stats = await sql`
        SELECT 
          COUNT(*)::int as total,
          COUNT(*) FILTER (WHERE ue.status_code >= 200 AND ue.status_code < 300)::int as success,
          COUNT(*) FILTER (WHERE ue.status_code >= 400)::int as errors,
          COALESCE(AVG(ue.duration_ms), 0)::float as avg_duration_ms
        FROM usage_events ue
        INNER JOIN api_keys ak ON ue.api_key_id = ak.id
        WHERE ak.user_id = ${userId}::uuid
          AND DATE(ue.created_at) = CURRENT_DATE
      `;
    } else {
      stats = await sql`
        SELECT 
          COUNT(*)::int as total,
          COUNT(*) FILTER (WHERE ue.status_code >= 200 AND ue.status_code < 300)::int as success,
          COUNT(*) FILTER (WHERE ue.status_code >= 400)::int as errors,
          COALESCE(AVG(ue.duration_ms), 0)::float as avg_duration_ms
        FROM usage_events ue
        INNER JOIN api_keys ak ON ue.api_key_id = ak.id
        WHERE ak.user_id = ${userId}::uuid
          AND DATE_TRUNC('month', ue.created_at) = DATE_TRUNC('month', CURRENT_DATE)
      `;
    }

    await sql.end();

    console.log(`Usage summary for user ${userId}, period: ${period}`);

    return new Response(JSON.stringify({
      period,
      total: stats[0]?.total || 0,
      success: stats[0]?.success || 0,
      errors: stats[0]?.errors || 0,
      avg_duration_ms: Math.round(stats[0]?.avg_duration_ms || 0)
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    const error = err as Error;
    console.error('Error getting usage summary:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
