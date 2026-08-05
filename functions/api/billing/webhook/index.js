export async function onRequestPost(context) {
  try {
    const body = await context.request.text();
    const signature = context.request.headers.get("stripe-signature");
    const webhookSecret = context.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      return Response.json({ error: "Webhook secret not configured" }, { status: 503 });
    }

    // For Cloudflare Pages Functions, we need to verify the webhook signature
    // This is a simplified version - in production, use the Stripe SDK
    const event = JSON.parse(body);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const storeId = session.metadata?.storeId;
      const planId = session.metadata?.planId;

      if (storeId && planId) {
        // Update store plan in KV
        try {
          const stores = (await context.env.KV.get("stores", "json")) ?? [];
          const storeIndex = stores.findIndex((s) => s.id === storeId);
          if (storeIndex >= 0) {
            stores[storeIndex].plan = planId;
            stores[storeIndex].stripeCustomerId = session.customer;
            stores[storeIndex].stripeSubscriptionId = session.subscription;
            stores[storeIndex].updatedAt = new Date().toISOString();
            await context.env.KV.put("stores", JSON.stringify(stores));
          }
        } catch (err) {
          console.error("Failed to update store plan:", err);
        }
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;
      // Downgrade store to free plan
      try {
        const stores = (await context.env.KV.get("stores", "json")) ?? [];
        const storeIndex = stores.findIndex((s) => s.stripeSubscriptionId === subscription.id);
        if (storeIndex >= 0) {
          stores[storeIndex].plan = "free";
          stores[storeIndex].stripeSubscriptionId = undefined;
          stores[storeIndex].updatedAt = new Date().toISOString();
          await context.env.KV.put("stores", JSON.stringify(stores));
        }
      } catch (err) {
        console.error("Failed to downgrade store:", err);
      }
    }

    return Response.json({ received: true });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Invalid request" },
      { status: 400 }
    );
  }
}
