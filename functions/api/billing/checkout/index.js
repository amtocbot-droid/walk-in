export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const { storeId, planId, billingCycle = "monthly" } = body;

    if (!storeId || !planId) {
      return Response.json({ error: "storeId and planId are required" }, { status: 400 });
    }

    const stripeSecretKey = context.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return Response.json({ error: "Stripe is not configured" }, { status: 503 });
    }

    // Get price ID based on plan and billing cycle
    const priceIds = {
      pro: {
        monthly: context.env.STRIPE_PRICE_PRO_MONTHLY,
        yearly: context.env.STRIPE_PRICE_PRO_YEARLY,
      },
      enterprise: {
        monthly: context.env.STRIPE_PRICE_ENTERPRISE_MONTHLY,
        yearly: context.env.STRIPE_PRICE_ENTERPRISE_YEARLY,
      },
    };

    const priceId = priceIds[planId]?.[billingCycle];
    if (!priceId) {
      return Response.json(
        { error: `Price ID not configured for ${planId} ${billingCycle}` },
        { status: 500 }
      );
    }

    // Create Stripe checkout session
    const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Bearer ${stripeSecretKey}`,
      },
      body: new URLSearchParams({
        mode: "subscription",
        "payment_method_types[]": "card",
        "line_items[0][price]": priceId,
        "line_items[0][quantity]": "1",
        success_url: `${context.env.NEXT_PUBLIC_APP_URL ?? "https://walk-in-cfa.pages.dev"}/owner?billing=success`,
        cancel_url: `${context.env.NEXT_PUBLIC_APP_URL ?? "https://walk-in-cfa.pages.dev"}/pricing`,
        "metadata[storeId]": storeId,
        "metadata[planId]": planId,
      }),
    });

    if (!stripeResponse.ok) {
      const error = await stripeResponse.text();
      return Response.json(
        { error: `Stripe error: ${stripeResponse.status} ${error}` },
        { status: stripeResponse.status }
      );
    }

    const session = await stripeResponse.json();
    return Response.json({ checkoutUrl: session.url });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Invalid request" },
      { status: 400 }
    );
  }
}
