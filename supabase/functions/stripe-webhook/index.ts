import postgres from "https://deno.land/x/postgresjs@v3.4.4/mod.js";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

// Map Stripe price IDs to plan + monthly_limit
function mapPriceToPlan(priceId: string): { plan: string; monthlyLimit: number } | null {
  const proPriceAnnual = Deno.env.get('STRIPE_PRICE_PRO_ANNUAL');
  const proPriceMonthly = Deno.env.get('STRIPE_PRICE_PRO_MONTHLY');
  const proPlusPriceAnnual = Deno.env.get('STRIPE_PRICE_PROPLUS_ANNUAL');
  const proPlusPriceMonthly = Deno.env.get('STRIPE_PRICE_PROPLUS_MONTHLY');

  if (priceId === proPriceAnnual || priceId === proPriceMonthly) {
    return { plan: 'pro', monthlyLimit: 5000 };
  }
  if (priceId === proPlusPriceAnnual || priceId === proPlusPriceMonthly) {
    return { plan: 'pro_plus', monthlyLimit: 50000 };
  }
  
  return null;
}

// Normalize Stripe subscription status to our status values
function normalizeStatus(stripeStatus: string): string {
  switch (stripeStatus) {
    case 'active':
    case 'trialing':
      return 'active';
    case 'past_due':
    case 'unpaid':
      return 'past_due';
    case 'canceled':
    case 'incomplete_expired':
      return 'canceled';
    default:
      return 'active';
  }
}

function getDbConnection() {
  const databaseUrl = Deno.env.get("DATABASE_URL");
  if (!databaseUrl) {
    throw new Error("CONFIG: DATABASE_URL missing");
  }
  return postgres(databaseUrl, { 
    ssl: false,
    connection: { application_name: 'nexart-stripe-webhook' }
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Initialize Stripe
  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  
  if (!stripeKey || !webhookSecret) {
    console.error('[STRIPE-WEBHOOK] Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET');
    return new Response(JSON.stringify({ error: 'CONFIG', message: 'Webhook not configured' }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

  // Get signature from headers
  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    console.error('[STRIPE-WEBHOOK] Missing stripe-signature header');
    return new Response(JSON.stringify({ error: 'VALIDATION', message: 'Missing signature' }), { 
      status: 400, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }

  // CRITICAL: Get raw body for verification - do NOT parse as JSON first
  const body = await req.text();

  // Verify webhook signature using async method for Deno
  let event: Stripe.Event;
  try {
    // Deno uses async Web Crypto API - must use constructEventAsync with SubtleCryptoProvider
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
      undefined,
      Stripe.createSubtleCryptoProvider()
    );
  } catch (err) {
    const error = err as Error;
    console.error('[STRIPE-WEBHOOK] Signature verification failed:', error.message);
    return new Response(JSON.stringify({ error: 'VALIDATION', message: 'Invalid signature' }), { 
      status: 400, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }

  console.log(`[STRIPE-WEBHOOK] Received event: ${event.type}, id: ${event.id}`);

  // Handle known event types, return 200 for unhandled
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;
        const userId = session.metadata?.user_id;

        console.log(`[STRIPE-WEBHOOK] Checkout completed: customer=${customerId}, subscription=${subscriptionId}, user=${userId}`);

        if (userId && customerId) {
          const sql = getDbConnection();
          try {
            await sql`
              UPDATE accounts 
              SET stripe_customer_id = ${customerId},
                  stripe_subscription_id = ${subscriptionId},
                  updated_at = now()
              WHERE user_id = ${userId}::uuid
            `;
            console.log(`[STRIPE-WEBHOOK] Updated account with customer ${customerId} for user ${userId}`);
          } finally {
            await sql.end();
          }
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const subscriptionId = subscription.id;
        const currentPeriodEnd = new Date(subscription.current_period_end * 1000);
        const cancelAtPeriodEnd = subscription.cancel_at_period_end;
        
        const priceId = subscription.items.data[0]?.price?.id;
        
        if (!priceId) {
          console.error(`[STRIPE-WEBHOOK] No price found in subscription ${subscriptionId}`);
          break;
        }

        const planInfo = mapPriceToPlan(priceId);
        
        if (!planInfo) {
          console.error(`[STRIPE-WEBHOOK] Unknown price ID: ${priceId} for subscription ${subscriptionId}`);
          break;
        }

        // Determine status: if cancel_at_period_end is true, set 'canceling'
        // Otherwise normalize the Stripe status
        let status: string;
        if (cancelAtPeriodEnd && (subscription.status === 'active' || subscription.status === 'trialing')) {
          status = 'canceling';
          console.log(`[STRIPE-WEBHOOK] Subscription marked for cancellation at period end: ${subscriptionId}`);
        } else {
          status = normalizeStatus(subscription.status);
        }

        console.log(`[STRIPE-WEBHOOK] Subscription ${event.type}: id=${subscriptionId}, status=${status}, plan=${planInfo.plan}, limit=${planInfo.monthlyLimit}, cancel_at_period_end=${cancelAtPeriodEnd}`);

        const sql = getDbConnection();
        try {
          const result = await sql`
            UPDATE accounts 
            SET plan = ${planInfo.plan},
                monthly_limit = ${planInfo.monthlyLimit},
                status = ${status},
                stripe_subscription_id = ${subscriptionId},
                stripe_price_id = ${priceId},
                current_period_end = ${currentPeriodEnd},
                updated_at = now()
            WHERE stripe_customer_id = ${customerId}
            RETURNING user_id
          `;

          if (result.length > 0) {
            console.log(`[STRIPE-WEBHOOK] Updated account for customer ${customerId}: plan=${planInfo.plan}, status=${status}`);
          } else {
            console.warn(`[STRIPE-WEBHOOK] No account found for customer ${customerId}`);
          }
        } finally {
          await sql.end();
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const subscriptionId = subscription.id;
        const periodEnd = new Date(subscription.current_period_end * 1000);

        console.log(`[STRIPE-WEBHOOK] Subscription deleted for customer ${customerId}, subscription: ${subscriptionId}`);

        const sql = getDbConnection();
        try {
          // Downgrade to free plan - subscription is fully canceled
          const result = await sql`
            UPDATE accounts 
            SET plan = 'free',
                monthly_limit = 100,
                status = 'canceled',
                stripe_subscription_id = NULL,
                stripe_price_id = NULL,
                current_period_end = ${periodEnd},
                updated_at = now()
            WHERE stripe_customer_id = ${customerId}
            RETURNING user_id
          `;

          if (result.length > 0) {
            console.log(`[STRIPE-WEBHOOK] Downgraded account for customer ${customerId} to free plan`);
          } else {
            console.warn(`[STRIPE-WEBHOOK] No account found for customer ${customerId}`);
          }
        } finally {
          await sql.end();
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        console.log(`[STRIPE-WEBHOOK] Payment failed for customer ${customerId}`);

        const sql = getDbConnection();
        try {
          await sql`
            UPDATE accounts 
            SET status = 'past_due',
                updated_at = now()
            WHERE stripe_customer_id = ${customerId}
          `;
        } finally {
          await sql.end();
        }
        break;
      }

      default:
        // Return 200 for unhandled events (log and ignore)
        console.log(`[STRIPE-WEBHOOK] Unhandled event type: ${event.type} - acknowledging`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    const error = err as Error;
    console.error('[STRIPE-WEBHOOK] Error processing event:', error.message);
    
    return new Response(JSON.stringify({ 
      error: 'INTERNAL', 
      message: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
