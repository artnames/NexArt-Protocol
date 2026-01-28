import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import postgres from "https://deno.land/x/postgresjs@v3.4.4/mod.js";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Account-level plan limits (NOT per key)
const PLAN_LIMITS: Record<string, number> = {
  free: 100,
  pro: 5000,
  team: 50000,
  enterprise: 1000000,
};

function getDbConnection() {
  const databaseUrl = Deno.env.get("DATABASE_URL");
  
  if (!databaseUrl) {
    throw new Error("CONFIG: DATABASE_URL missing");
  }

  return postgres(databaseUrl, { 
    ssl: false,
    connection: {
      application_name: 'nexart-account-plan'
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
      // Check if accounts table exists and get plan, otherwise derive from user metadata or default to free
      // For now, we'll check for an accounts record, or default to free
      const accountResult = await sql`
        SELECT plan, monthly_limit 
        FROM accounts 
        WHERE user_id = ${userId}::uuid
        LIMIT 1
      `;

      let plan = 'free';
      let monthlyLimit = PLAN_LIMITS.free;

      if (accountResult.length > 0) {
        plan = accountResult[0].plan;
        monthlyLimit = accountResult[0].monthly_limit || PLAN_LIMITS[plan] || PLAN_LIMITS.free;
      }

      // Get current month usage aggregated across ALL user's keys
      const usageResult = await sql`
        SELECT COUNT(*)::int as used
        FROM usage_events ue
        INNER JOIN api_keys ak ON ue.api_key_id = ak.id
        WHERE ak.user_id = ${userId}::uuid
          AND DATE_TRUNC('month', ue.ts) = DATE_TRUNC('month', CURRENT_DATE)
          AND ue.endpoint NOT LIKE 'audit:%'
      `;

      const used = usageResult[0]?.used || 0;
      const remaining = Math.max(0, monthlyLimit - used);

      await sql.end();

      console.log(`Account plan for user ${userId}: ${plan}, used: ${used}/${monthlyLimit}`);

      return new Response(JSON.stringify({
        plan,
        monthlyLimit,
        used,
        remaining,
        planName: getPlanName(plan),
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (dbError) {
      await sql.end();
      
      // If accounts table doesn't exist, return free plan defaults
      const error = dbError as Error;
      if (error.message?.includes('relation "accounts" does not exist')) {
        console.log(`Accounts table not found for user ${userId}, defaulting to free plan`);
        return new Response(JSON.stringify({
          plan: 'free',
          monthlyLimit: PLAN_LIMITS.free,
          used: 0,
          remaining: PLAN_LIMITS.free,
          planName: 'Free',
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      throw dbError;
    }

  } catch (err) {
    const error = err as Error;
    console.error('Error getting account plan:', error.message);
    
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

function getPlanName(plan: string): string {
  const names: Record<string, string> = {
    free: 'Free',
    pro: 'Pro',
    team: 'Pro+ / Team',
    enterprise: 'Enterprise',
  };
  return names[plan] || 'Free';
}
