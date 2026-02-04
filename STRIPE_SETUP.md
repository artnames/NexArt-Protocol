# Stripe Subscription Setup for NexArt.io

## Environment Variables Required

All secrets should be configured in Supabase Edge Function secrets:

| Secret Name | Description | Example |
|------------|-------------|---------|
| `STRIPE_SECRET_KEY` | Stripe API secret key (starts with `sk_`) | `sk_live_...` or `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret (starts with `whsec_`) | `whsec_...` |
| `STRIPE_PRICE_PRO_ANNUAL` | Price ID for Pro annual plan | `price_abc123` |
| `STRIPE_PRICE_PRO_MONTHLY` | Price ID for Pro monthly plan | `price_def456` |
| `STRIPE_PRICE_PROPLUS_ANNUAL` | Price ID for Pro+ annual plan | `price_ghi789` |
| `STRIPE_PRICE_PROPLUS_MONTHLY` | Price ID for Pro+ monthly plan | `price_jkl012` |
| `STRIPE_PORTAL_RETURN_URL` | Return URL after portal session | `https://nexart.io/pricing` |
| `STRIPE_SUCCESS_URL` | Redirect after successful checkout | `https://nexart.io/pricing?billing=success` |
| `STRIPE_CANCEL_URL` | Redirect after canceled checkout | `https://nexart.io/pricing?billing=cancel` |

## Database Migration (Railway Postgres)

Run this SQL on your Railway Postgres database to add the required Stripe columns:

```sql
-- Add Stripe-related columns to accounts table for subscription management
ALTER TABLE public.accounts 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS stripe_price_id TEXT,
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active',
ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_accounts_stripe_customer_id ON public.accounts(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_accounts_stripe_subscription_id ON public.accounts(stripe_subscription_id);

-- Verify the changes
\d accounts
```

## Stripe Webhook Configuration

1. Go to Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://tnvckrssolgjrtcfhnwm.supabase.co/functions/v1/stripe-webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Copy the signing secret and set it as `STRIPE_WEBHOOK_SECRET`

## Edge Functions Created

| Function | Purpose | Auth |
|----------|---------|------|
| `stripe-checkout` | Creates Stripe Checkout sessions for Pro/Pro+ subscriptions | Required |
| `stripe-portal` | Creates Stripe Billing Portal sessions for subscription management | Required |
| `stripe-webhook` | Handles Stripe webhook events and updates account plans | None (signature verified) |

## API Examples

### Create Checkout Session

```bash
curl -X POST https://tnvckrssolgjrtcfhnwm.supabase.co/functions/v1/stripe-checkout \
  -H "Authorization: Bearer YOUR_SUPABASE_JWT" \
  -H "Content-Type: application/json" \
  -d '{"plan": "pro", "cadence": "annual"}'

# Response:
# {"url": "https://checkout.stripe.com/..."}
```

### Open Billing Portal

```bash
curl -X POST https://tnvckrssolgjrtcfhnwm.supabase.co/functions/v1/stripe-portal \
  -H "Authorization: Bearer YOUR_SUPABASE_JWT" \
  -H "Content-Type: application/json" \
  -d '{}'

# Response:
# {"url": "https://billing.stripe.com/..."}
```

## Testing Checklist (Test Mode)

### Initial Subscription Flow
- [ ] Toggle to Monthly on pricing page, click Subscribe on Pro
- [ ] Complete checkout with test card (4242 4242 4242 4242)
- [ ] Verify redirect to success URL
- [ ] Confirm webhook updates `accounts.plan = 'pro'` and `monthly_limit = 5000`
- [ ] Check dashboard shows Pro plan

### Subscription Management
- [ ] Click "Manage Billing" button
- [ ] Verify portal opens with current subscription
- [ ] Cancel subscription in portal
- [ ] Confirm webhook sets `plan = 'free'` and `monthly_limit = 100`

### Payment Failure Handling
- [ ] Create subscription with test card
- [ ] Use Stripe dashboard to simulate payment failure
- [ ] Confirm `status = 'past_due'` but plan NOT downgraded

### Annual vs Monthly
- [ ] Test Pro Annual ($6,000/year) checkout
- [ ] Test Pro+ Monthly ($1,800/month) checkout
- [ ] Verify correct price IDs used

## Plan Mapping

| Plan | Price ID Env | Monthly Limit | API Key Limit |
|------|--------------|---------------|---------------|
| Free | N/A | 100 | 2 |
| Pro | `STRIPE_PRICE_PRO_ANNUAL` / `STRIPE_PRICE_PRO_MONTHLY` | 5,000 | 5 |
| Pro+ | `STRIPE_PRICE_PROPLUS_ANNUAL` / `STRIPE_PRICE_PROPLUS_MONTHLY` | 50,000 | 10 |
| Enterprise | Custom (contact) | Custom | Custom |

## Security Notes

- Webhooks are verified using Stripe signature
- No Stripe secrets are exposed to the frontend
- Plan changes only happen through webhooks (source of truth)
- Customer creation happens server-side only
