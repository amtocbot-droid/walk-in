# Stripe Setup Guide for Walk In

## Current Status

Your Stripe account is configured with the following products:

- **Pro Monthly:** $99.00 USD per month (`price_1U0tjsIq02Groz422KtMbeTa`)
- **Pro Yearly:** $999.00 USD per year (`price_1U0tkAIq02Groz42THpLhLue`)
- **Enterprise Monthly:** $499.00 USD per month (`price_1U0tkSIq02Groz42Yka1gqx1`)
- **Enterprise Yearly:** $4,999.00 USD per year (`price_1U0tkoIq02Groz426YMCjna5`)

## Environment Variables Configured

The following secrets are set in Cloudflare Pages:

- `STRIPE_SECRET_KEY` — Your Stripe secret key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — Your Stripe publishable key
- `STRIPE_PRICE_PRO_MONTHLY` — Pro monthly price ID
- `STRIPE_PRICE_PRO_YEARLY` — Pro yearly price ID
- `STRIPE_PRICE_ENTERPRISE_MONTHLY` — Enterprise monthly price ID
- `STRIPE_PRICE_ENTERPRISE_YEARLY` — Enterprise yearly price ID

## Known Issue: Billing Endpoint Routing

The billing checkout endpoint (`/api/billing/checkout`) is currently returning errors due to Cloudflare Pages Functions routing configuration. This is a known issue that requires further investigation.

## How to Test Checkout Manually

Until the endpoint is fixed, you can test checkout directly with Stripe:

### Option 1: Stripe Dashboard
1. Go to https://dashboard.stripe.com/test/payments
2. Click "Create payment link"
3. Select your Pro or Enterprise product
4. Share the link with customers

### Option 2: Direct Stripe Checkout URL
```
https://checkout.stripe.com/c/pay/cs_test_...
```

### Option 3: Use Stripe CLI
```bash
stripe checkout sessions create \
  --mode subscription \
  --line-items[0][price]=price_1U0tjsIq02Groz422KtMbeTa \
  --line-items[0][quantity]=1 \
  --success-url=https://walk-in-cfa.pages.dev/owner?billing=success \
  --cancel-url=https://walk-in-cfa.pages.dev/pricing
```

## Next Steps to Start Monetizing

### Immediate (This Week)
1. **Set up Stripe webhook** for subscription events:
   - Go to https://dashboard.stripe.com/test/webhooks
   - Add endpoint: `https://walk-in-cfa.pages.dev/api/billing/webhook`
   - Select events: `checkout.session.completed`, `customer.subscription.deleted`
   - Copy the webhook signing secret

2. **Configure webhook secret** in Cloudflare Pages:
   ```bash
   npx wrangler pages secret put STRIPE_WEBHOOK_SECRET --project-name=walk-in
   ```

3. **Test checkout flow** with a real customer:
   - Share pricing page: https://walk-in-cfa.pages.dev/pricing
   - Have them complete checkout
   - Verify subscription appears in Stripe dashboard

### Short-term (This Month)
1. **Fix billing endpoint routing** — investigate Cloudflare Pages Functions configuration
2. **Add customer portal** for subscription management
3. **Implement plan enforcement** based on Stripe subscription status
4. **Launch paid beta** with 10-20 businesses

### Long-term (This Quarter)
1. **Add transaction fees** for marketplace sales
2. **Build retail media dashboard** for advertising
3. **Create partner program** for agencies
4. **Scale to $10K MRR**

## Support

If you need help with Stripe configuration:
- Stripe Dashboard: https://dashboard.stripe.com
- Stripe Docs: https://stripe.com/docs
- Cloudflare Pages: https://developers.cloudflare.com/pages

---

**Last Updated:** August 2026
**Status:** Stripe configured, billing endpoint needs routing fix
