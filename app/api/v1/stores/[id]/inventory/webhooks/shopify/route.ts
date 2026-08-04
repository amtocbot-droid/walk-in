import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { securityHeaders } from "@/lib/security";
import {
  verifyShopifyWebhook,
  shopifyProductToProducts,
  ShopifyWebhookProduct,
} from "@/lib/inventory-sources/shopify";

const paramsSchema = z.object({ id: z.string() });

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = paramsSchema.parse(await params);
  const topic = request.headers.get("x-shopify-topic");
  const shopDomain = request.headers.get("x-shopify-shop-domain");
  const hmac = request.headers.get("x-shopify-hmac-sha256");
  const body = await request.text();

  // In production, verify against the store's configured webhook secret.
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET ?? "";
  if (secret && !verifyShopifyWebhook(body, hmac, secret)) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
  }

  if (!shopDomain) {
    return NextResponse.json({ error: "Missing shop domain" }, { status: 400 });
  }

  const payload = JSON.parse(body) as ShopifyWebhookProduct;

  // Webhook persistence requires a server-side database.
  // For this prototype, the endpoint validates and logs the payload.
  // Future: look up store owner by shopDomain, then update product records.
  if (topic === "products/update" || topic === "products/create") {
    const products = shopifyProductToProducts(payload);
    console.log("[shopify webhook]", { storeId: id, shopDomain, topic, products });
  }

  const response = NextResponse.json({ received: true, topic, shopDomain });
  return securityHeaders(response);
}
