# Stripe Payment Links for Walk In

Use these links to start charging customers immediately. No code changes needed.

## 🔗 Payment Links

### Pro Plan
- **Monthly ($99/month):** https://buy.stripe.com/test_fZu6oH8w1bOT6Gm2nec7u00
- **Yearly ($999/year):** https://buy.stripe.com/test_00wfZh4fL6uz4ye7Hyc7u01

### Enterprise Plan
- **Monthly ($499/month):** https://buy.stripe.com/test_28E4gz4fL5qvggW4vmc7u02
- **Yearly ($4,999/year):** https://buy.stripe.com/test_aFaaEXh2xg59c0G7Hyc7u03

## 💳 Test Cards

Use these test cards to verify the checkout flow:

| Card Number | Description |
|-------------|-------------|
| 4242 4242 4242 4242 | Successful payment |
| 4000 0000 0000 0002 | Card declined |
| 4000 0000 0000 9995 | Insufficient funds |
| 4000 0000 0000 9989 | Lost card |

**Expiry:** Any future date (e.g., 12/25)
**CVC:** Any 3 digits (e.g., 123)
**ZIP:** Any 5 digits (e.g., 12345)

## 🚀 How to Use

### For Beta Customers

1. **Share the payment link** with your customer
2. **They complete checkout** on Stripe's secure page
3. **They get redirected** to the owner dashboard
4. **You manually upgrade** their plan in the dashboard

### For Testing

1. **Use a test card** from the table above
2. **Complete checkout** with any valid email
3. **Check the redirect** to the owner dashboard
4. **Verify the subscription** in Stripe dashboard

## 📊 What Happens After Payment

1. **Customer completes checkout** on Stripe
2. **Stripe redirects** to `https://walk-in-cfa.pages.dev/owner?billing=success`
3. **Webhook fires** to `https://walk-in-cfa.pages.dev/api/billing/webhook`
4. **Store plan is updated** in the database (currently KV, will be PostgreSQL)

## 🔧 Manual Plan Upgrade

Since the webhook endpoint has routing issues, you'll need to manually upgrade plans:

1. **Go to** https://walk-in-cfa.pages.dev/owner
2. **Sign in** with the customer's account
3. **Check their store plan** in the dashboard
4. **Update the plan** in Stripe dashboard or manually in the database

## 📈 Beta Launch Checklist

- [ ] Test all 4 payment links with test cards
- [ ] Verify redirect to owner dashboard works
- [ ] Confirm webhook receives events (check Stripe dashboard)
- [ ] Prepare beta pricing (50% discount codes)
- [ ] Create customer onboarding email sequence
- [ ] Set up support channel (email, Discord, etc.)

## 💰 Beta Pricing Strategy

**Offer 50% discount for first 3 months:**

- **Pro Monthly:** $49.50/month (normally $99)
- **Pro Yearly:** $499.50/year (normally $999)
- **Enterprise Monthly:** $249.50/month (normally $499)
- **Enterprise Yearly:** $2,499.50/year (normally $4,999)

**Create discount codes in Stripe:**
1. Go to https://dashboard.stripe.com/test/coupons
2. Create coupon: 50% off for 3 months
3. Share the coupon code with beta customers

## 📞 Support

If customers have issues:
- **Stripe Dashboard:** https://dashboard.stripe.com/test/payments
- **Email:** seolith.com@gmail.com
- **Documentation:** https://walk-in-cfa.pages.dev/docs

---

**Ready to launch?** Share these payment links with your first 10-20 beta customers and start making money!
