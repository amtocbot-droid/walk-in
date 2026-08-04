import { api } from "./api";

export interface Store {
  id: string;
  ownerId: string;
  name: string;
  plan?: "free" | "pro" | "enterprise";
  createdAt: string;
}

function storageKey(ownerId: string): string {
  return `walk-in-stores-${ownerId}`;
}

export function loadStores(ownerId: string): Store[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(storageKey(ownerId));
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Store[];
  } catch {
    return [];
  }
}

export function saveStores(ownerId: string, stores: Store[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKey(ownerId), JSON.stringify(stores));
}

export function createStore(ownerId: string, name: string): Store {
  const store: Store = {
    id: `store_${Date.now().toString(36)}`,
    ownerId,
    name,
    plan: "free",
    createdAt: new Date().toISOString(),
  };
  const stores = loadStores(ownerId);
  stores.push(store);
  saveStores(ownerId, stores);

  void api.stores.create({ name, ownerId }).catch((err) => console.error("Store sync failed:", err));

  return store;
}

export function deleteStore(ownerId: string, storeId: string): void {
  const stores = loadStores(ownerId).filter((s) => s.id !== storeId);
  saveStores(ownerId, stores);

  // Server deletion is handled via API route when available.
}
