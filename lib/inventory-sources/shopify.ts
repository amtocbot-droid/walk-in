import { createHmac } from "crypto";
import { Product } from "@/lib/store";
import { ShopifyInventorySource } from "./types";
import { addOrUpdateSource } from "./storage";

export function verifyShopifyWebhook(
  body: string,
  hmacHeader: string | null,
  secret: string
): boolean {
  if (!hmacHeader) return false;
  const hash = createHmac("sha256", secret).update(body, "utf8").digest("base64");
  return hash === hmacHeader;
}

export interface ShopifyWebhookProduct {
  id: number;
  title: string;
  variants?: Array<{
    id: number;
    sku?: string;
    price: string;
    inventory_quantity?: number;
    inventory_item_id?: number;
    title?: string;
  }>;
}

export interface ShopifyWebhookInventory {
  inventory_item_id: number;
  available: number;
  location_id: number;
}

export function shopifyProductToProducts(payload: ShopifyWebhookProduct): Product[] {
  const baseName = payload.title;
  const variants = payload.variants ?? [];

  if (variants.length === 0) {
    return [
      {
        sku: `shopify_${payload.id}`,
        name: baseName,
        price: 0,
        currency: "USD",
        availability: "InStock",
        inventoryLevel: 0,
      },
    ];
  }

  return variants.map((v) => ({
    sku: v.sku?.trim() || `shopify_${v.id}`,
    name: variants.length > 1 ? `${baseName} — ${v.title}` : baseName,
    price: parseFloat(v.price) || 0,
    currency: "USD",
    availability: (v.inventory_quantity ?? 0) > 0 ? "InStock" : "OutOfStock",
    inventoryLevel: v.inventory_quantity ?? 0,
  }));
}

export function registerShopifySource(
  userId: string,
  storeId: string,
  shopDomain: string
): ShopifyInventorySource {
  const source: ShopifyInventorySource = {
    id: `shopify_${shopDomain.replace(/\./g, "_")}`,
    storeId,
    type: "shopify",
    label: `Shopify: ${shopDomain}`,
    enabled: true,
    shopDomain,
  };
  addOrUpdateSource(userId, source);
  return source;
}
