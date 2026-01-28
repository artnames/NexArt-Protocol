import postgres from "https://deno.land/x/postgresjs@v3.4.4/mod.js";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const databaseUrl = Deno.env.get("DATABASE_URL");
  
  if (!databaseUrl) {
    return new Response(JSON.stringify({ 
      status: 'error',
      error: 'CONFIG',
      message: 'DATABASE_URL environment variable is not set',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  let dbHost = 'unknown';
  let dbPort = 'unknown';
  try {
    const url = new URL(databaseUrl);
    dbHost = url.hostname;
    dbPort = url.port || '5432';
  } catch {
    // URL parsing failed
  }

  try {
    console.log(`Attempting connection to ${dbHost}:${dbPort}`);
    
    const sql = postgres(databaseUrl, {
      ssl: false,
      connection: {
        application_name: 'nexart-db-health'
      }
    });

    // Simple connectivity test
    const result = await sql`SELECT 1 as ok, NOW() as server_time, version() as pg_version`;
    
    // Get table list
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      LIMIT 10
    `;

    // Get api_keys schema
    const apiKeysSchema = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'api_keys'
      ORDER BY ordinal_position
    `;

    // Get usage_events schema
    const usageEventsSchema = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'usage_events'
      ORDER BY ordinal_position
    `;

    await sql.end();

    return new Response(JSON.stringify({ 
      status: 'healthy',
      db: {
        host: dbHost,
        port: dbPort,
        connected: true,
        serverTime: result[0].server_time,
        pgVersion: result[0].pg_version?.split(' ')[0],
        tables: tables.map(t => t.table_name)
      },
      schemas: {
        api_keys: apiKeysSchema.map(c => ({ name: c.column_name, type: c.data_type, nullable: c.is_nullable })),
        usage_events: usageEventsSchema.map(c => ({ name: c.column_name, type: c.data_type, nullable: c.is_nullable }))
      },
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    const error = err as Error;
    console.error('DB health check failed:', error.message);

    return new Response(JSON.stringify({ 
      status: 'unhealthy',
      error: 'DB_CONNECTION',
      message: error.message,
      db: {
        host: dbHost,
        port: dbPort,
        connected: false
      },
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
