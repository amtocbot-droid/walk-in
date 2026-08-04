import { Product } from "@/lib/store";
import { loadOwnerScene } from "@/lib/scene-config";
import { InventorySource, ResolvedInventory, CsvInventorySource } from "./types";
import { loadInventorySources } from "./storage";

export * from "./types";
export * from "./storage";
export * from "./csv";

export async function resolveInventory(
  userId: string,
  storeId: string
): Promise<ResolvedInventory> {
  const sources: InventorySource[] = [];

  // 1. Owner-configured scene products (hotspots + manual entries)
  const ownerScene = loadOwnerScene(userId, storeId);
  if (ownerScene && ownerScene.products.length > 0) {
    sources.push({
      id: "owner-scene",
      storeId,
      type: "owner",
      label: "Owner Dashboard",
      enabled: true,
      lastSyncedAt: ownerScene.updatedAt,
    });
  }

  // 2. Connected inventory sources (CSV, Shopify, Square, etc.)
  const connected = loadInventorySources(userId, storeId);
  sources.push(...connected.filter((s) => s.enabled));

  // Aggregate products: owner scene + CSV data.
  // Later: Shopify/Square sources will be fetched live or from cached webhook data.
  let products: Product[] = [];

  if (ownerScene) {
    products = [...ownerScene.products];
  }

  for (const source of connected) {
    if (!source.enabled) continue;
    if (source.type === "csv") {
      products = mergeProducts(products, (source as CsvInventorySource).data);
    }
  }

  return {
    sources,
    products,
    meta: {
      totalSources: sources.length,
      lastUpdated: new Date().toISOString(),
    },
  };
}

function mergeProducts(existing: Product[], incoming: Product[]): Product[] {
  const map = new Map(existing.map((p) => [p.sku, p]));
  for (const p of incoming) {
    // Preserve coordinates from existing owner scene if CSV lacks them.
    const current = map.get(p.sku);
    map.set(p.sku, {
      ...current,
      ...p,
      coordinates: p.coordinates ?? current?.coordinates,
    });
  }
  return Array.from(map.values());
}
