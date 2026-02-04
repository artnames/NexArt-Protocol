import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import postgres from "https://deno.land/x/postgresjs@v3.4.4/mod.js";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Map plan + cadence to Stripe Price IDs
function getPriceId(plan: string, cadence: string): string | null {
  const priceMap: Record<string, string | undefined> = {
    'pro_annual': Deno.env.get('STRIPE_PRICE_PRO_ANNUAL'),
    'pro_monthly': Deno.env.get('STRIPE_PRICE_PRO_MONTHLY'),
    'pro_plus_annual': Deno.env.get('STRIPE_PRICE_PROPLUS_ANNUAL'),
    'pro_plus_monthly': Deno.env.get('STRIPE_PRICE_PROPLUS_MONTHLY'),
  };
  
  const key = `${plan}_${cadence}`;
  return priceMap[key] || null;
}

function getDbConnection() {
  const databaseUrl = Deno.env.get("DATABASE_URL");
  if (!databaseUrl) {
    throw new Error("CONFIG: DATABASE_URL missing");
  }
  return postgres(databaseUrl, { 
    ssl: false,
    connection: { application_name: 'nexart-stripe-checkout' }
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

    // Parse request body
    let body: { plan?: string; cadence?: string } = {};
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: 'VALIDATION', message: 'Invalid request body' }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const { plan, cadence } = body;
    
    // Validate plan
    if (!plan || !['pro', 'pro_plus'].includes(plan)) {
      return new Response(JSON.stringify({ error: 'VALIDATION', message: 'Invalid plan. Use: pro, pro_plus' }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Validate cadence
    if (!cadence || !['annual', 'monthly'].includes(cadence)) {
      return new Response(JSON.stringify({ error: 'VALIDATION', message: 'Invalid cadence. Use: annual, monthly' }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Get Stripe price ID
    const priceId = getPriceId(plan, cadence);
    if (!priceId) {
      console.error(`Missing Stripe price env var for ${plan}_${cadence}`);
      return new Response(JSON.stringify({ error: 'CONFIG', message: 'Stripe price not configured' }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Initialize Stripe
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      return new Response(JSON.stringify({ error: 'CONFIG', message: 'Stripe not configured' }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const userId = user.id;
    const userEmail = user.email;
    const sql = getDbConnection();

    try {
      // Check if user already has a stripe_customer_id
      let stripeCustomerId: string | null = null;
      
      const accountResult = await sql`
        SELECT stripe_customer_id FROM accounts WHERE user_id = ${userId}::uuid LIMIT 1
      `;
      
      if (accountResult.length > 0 && accountResult[0].stripe_customer_id) {
        stripeCustomerId = accountResult[0].stripe_customer_id;
        console.log(`Reusing existing Stripe customer: ${stripeCustomerId}`);
      } else {
        // Check if customer exists in Stripe by email
        const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
        
        if (customers.data.length > 0) {
          stripeCustomerId = customers.data[0].id;
          console.log(`Found existing Stripe customer by email: ${stripeCustomerId}`);
        } else {
          // Create new Stripe customer
          const customer = await stripe.customers.create({
            email: userEmail,
            metadata: { user_id: userId }
          });
          stripeCustomerId = customer.id;
          console.log(`Created new Stripe customer: ${stripeCustomerId}`);
        }

        // Store stripe_customer_id in accounts table
        await sql`
          INSERT INTO accounts (user_id, stripe_customer_id, plan, monthly_limit, status, created_at, updated_at)
          VALUES (${userId}::uuid, ${stripeCustomerId}, 'free', 100, 'active', now(), now())
          ON CONFLICT (user_id) DO UPDATE SET 
            stripe_customer_id = EXCLUDED.stripe_customer_id,
            updated_at = now()
        `;
      }

      await sql.end();

      // Get URLs from env or construct from origin/referer
      const origin = req.headers.get('origin') || req.headers.get('referer')?.replace(/\/$/, '') || Deno.env.get('APP_URL') || 'https://nexart-protocol-docs.lovable.app';
      const successUrl = Deno.env.get('STRIPE_SUCCESS_URL') || `${origin}/pricing?billing=success`;
      const cancelUrl = Deno.env.get('STRIPE_CANCEL_URL') || `${origin}/pricing?billing=cancel`;
      
      console.log(`Using success URL: ${successUrl}, cancel URL: ${cancelUrl}`);

      // Create Stripe Checkout Session
      const session = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          user_id: userId,
          plan: plan,
          cadence: cadence,
        },
      });

      console.log(`Created checkout session ${session.id} for user ${userId}, plan: ${plan}, cadence: ${cadence}`);

      return new Response(JSON.stringify({ url: session.url }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (dbError) {
      await sql.end();
      throw dbError;
    }

  } catch (err) {
    const error = err as Error;
    console.error('Error creating checkout session:', error.message);
    
    let errorCode = 'INTERNAL';
    if (error.message.includes('CONFIG')) errorCode = 'CONFIG';
    else if (error.message.includes('SSL') || error.message.includes('certificate')) errorCode = 'DB_SSL';
    else if (error.message.includes('connect')) errorCode = 'DB_CONNECTION';
    
    return new Response(JSON.stringify({ 
      error: errorCode, 
      message: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
