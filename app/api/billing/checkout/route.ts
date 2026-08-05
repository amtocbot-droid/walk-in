import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withApiSecurity } from "@/lib/security";
import { getStripe, isBillingEnabled } from "@/lib/billing/stripe";
import { getStripePriceId } from "@/lib/billing/plans";
import { getStore, updateStore } from "@/lib/db";

const bodySchema = z.object({
  storeId: z.string(),
  planId: z.enum(["pro", "enterprise"]),
  billingCycle: z.enum(["monthly", "yearly"]).default("monthly"),
});

export const POST = withApiSecurity(async (request: NextRequest) => {
  if (!isBillingEnabled()) {
    return NextResponse.json({ error: "Billing is not configured" }, { status: 503 });
  }

  const body = bodySchema.parse(await request.json());
  const store = await getStore(body.storeId);

  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });
  }

  const priceId = getStripePriceId(body.planId, body.billingCycle);
  if (!priceId) {
    return NextResponse.json(
      { error: `Stripe price ID not configured for ${body.planId} ${body.billingCycle}` },
      { status: 500 }
    );
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/owner?billing=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/pricing`,
    customer_email: undefined, // could be prefilled from session
    metadata: {
      storeId: body.storeId,
      planId: body.planId,
    },
  });

  if (session.customer && typeof session.customer === "string") {
    await updateStore(body.storeId, { stripeCustomerId: session.customer });
  }

  return NextResponse.json({ checkoutUrl: session.url });
});
