# Paid Beta Launch Guide

## Current Status

Your Walk In platform is configured for monetization with:

- **Stripe products** created (Pro Monthly/Yearly, Enterprise Monthly/Yearly)
- **Stripe keys** configured in Cloudflare Pages
- **Webhook endpoint** created for subscription events
- **Pricing page** with real checkout buttons

## Known Limitation

The billing checkout endpoint (`/api/billing/checkout`) is returning Cloudflare system errors due to Pages Functions routing configuration. This is a known issue that requires further investigation.

## How to Launch Paid Beta Now

### Option 1: Stripe Payment Links (Recommended)

Create payment links in your Stripe dashboard:

1. Go to https://dashboard.stripe.com/test/payments
2. Click "Create payment link"
3. Select your Pro or Enterprise product
4. Customize the success URL: `https://walk-in-cfa.pages.dev/owner?billing=success`
5. Share the link with beta customers

**Pro Monthly:** https://buy.stripe.com/test_...
**Pro Yearly:** https://buy.stripe.com/test_...
**Enterprise Monthly:** https://buy.stripe.com/test_...
**Enterprise Yearly:** https://buy.stripe.com/test_...

### Option 2: Stripe Checkout Sessions

Use the Stripe CLI to create checkout sessions:

```bash
# Pro Monthly
stripe checkout sessions create \
  --mode subscription \
  --line-items[0][price]=price_1U0tjsIq02Groz422KtMbeTa \
  --line-items[0][quantity]=1 \
  --success-url=https://walk-in-cfa.pages.dev/owner?billing=success \
  --cancel-url=https://walk-in-cfa.pages.dev/pricing

# Pro Yearly
stripe checkout sessions create \
  --mode subscription \
  --line-items[0][price]=price_1U0tkAIq02Groz42THpLhLue \
  --line-items[0][quantity]=1 \
  --success-url=https://walk-in-cfa.pages.dev/owner?billing=success \
  --cancel-url=https://walk-in-cfa.pages.dev/pricing
```

### Option 3: Direct Customer Signup

1. Customer visits https://walk-in-cfa.pages.dev/signup
2. Creates account and store
3. You manually create subscription in Stripe dashboard
4. Customer gets access to paid features

## Beta Launch Checklist

### Pre-Launch (This Week)

- [ ] Create Stripe payment links for all 4 products
- [ ] Test checkout flow with test card (4242 4242 4242 4242)
- [ ] Verify webhook receives subscription events
- [ ] Prepare onboarding email sequence
- [ ] Create customer success documentation

### Launch (Next Week)

- [ ] Recruit 10-20 beta customers from your network
- [ ] Offer 50% discount for first 3 months
- [ ] Collect feedback via weekly calls
- [ ] Track key metrics (MRR, churn, NPS)

### Post-Launch (Ongoing)

- [ ] Weekly customer feedback calls
- [ ] Monthly product updates based on feedback
- [ ] Case studies from successful customers
- [ ] Referral program for existing customers

## Pricing for Beta

**Recommended beta pricing:**

- **Pro Monthly:** $49/month (50% off, normally $99)
- **Pro Yearly:** $499/year (50% off, normally $999)
- **Enterprise Monthly:** $249/month (50% off, normally $499)
- **Enterprise Yearly:** $2,499/year (50% off, normally $4,999)

**Beta terms:**
- 3-month minimum commitment
- Full refund if not satisfied
- Direct access to founding team
- Influence product roadmap

## Success Metrics

**Week 1:**
- 10 beta customers signed up
- $500 MRR
- 50% activation rate (created first store)

**Month 1:**
- 20 beta customers
- $1,000 MRR
- 10% churn rate
- 3 case studies

**Month 3:**
- 50 paying customers
- $5,000 MRR
- 5% churn rate
- Product-market fit validated

## Support

For questions about the paid beta:
- Email: seolith.com@gmail.com
- Stripe Dashboard: https://dashboard.stripe.com
- Cloudflare Pages: https://dash.cloudflare.com

---

**Ready to launch?** Create your Stripe payment links and start recruiting beta customers today!
