import { Product } from "./store";
import { api } from "./api";

export interface OwnerSceneConfig {
  userId: string;
  storeId: string;
  storeName: string;
  panoramaUrl: string;
  meshUrl?: string;
  products: Product[];
  updatedAt: string;
}

function storageKey(userId: string, storeId: string): string {
  return `walk-in-scene-${userId}-${storeId}`;
}

export function saveOwnerScene(config: OwnerSceneConfig): void {
  if (typeof window === "undefined") return;
  const updated = { ...config, updatedAt: new Date().toISOString() };
  localStorage.setItem(storageKey(config.userId, config.storeId), JSON.stringify(updated));

  // Fire-and-forget sync to server.
  void api.scene.save(config.storeId, {
    format: updated.meshUrl ? "glb" : "equirectangular",
    assetUrl: updated.meshUrl || updated.panoramaUrl,
    hotspots: updated.products
      .filter((p) => p.coordinates)
      .map((p, i) => ({
        id: `hp_${i}`,
        position: p.coordinates!,
        productId: p.sku,
        label: p.name,
      })),
  }).catch((err) => console.error("Scene sync failed:", err));

  for (const product of updated.products) {
    void api.products.upsert(config.storeId, product).catch((err) => console.error("Product sync failed:", err));
  }
}

export function loadOwnerScene(userId: string, storeId: string): OwnerSceneConfig | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(storageKey(userId, storeId));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as OwnerSceneConfig;
  } catch {
    return null;
  }
}

export function clearOwnerScene(userId: string, storeId: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(storageKey(userId, storeId));
}

export function createDefaultScene(userId: string, storeId: string): OwnerSceneConfig {
  return {
    userId,
    storeId,
    storeName: "My Store",
    panoramaUrl: "",
    products: [],
    updatedAt: new Date().toISOString(),
  };
}
