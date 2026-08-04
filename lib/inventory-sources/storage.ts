import {
  InventorySource,
  CsvInventorySource,
  ShopifyInventorySource,
} from "./types";

function storageKey(userId: string, storeId: string): string {
  return `walk-in-inventory-sources-${userId}-${storeId}`;
}

export function loadInventorySources(userId: string, storeId: string): InventorySource[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(storageKey(userId, storeId));
  if (!raw) return [];
  try {
    const all = JSON.parse(raw) as InventorySource[];
    return all.filter((s) => s.storeId === storeId);
  } catch {
    return [];
  }
}

export function saveInventorySources(
  userId: string,
  sources: InventorySource[]
): void {
  if (typeof window === "undefined") return;
  if (sources.length === 0) return;
  const storeId = sources[0].storeId;
  const raw = localStorage.getItem(storageKey(userId, storeId));
  let all: InventorySource[] = [];
  try {
    all = raw ? (JSON.parse(raw) as InventorySource[]) : [];
  } catch {
    all = [];
  }

  const otherStores = all.filter(
    (s) => !sources.some((ns) => ns.storeId === s.storeId && ns.id === s.id)
  );
  localStorage.setItem(
    storageKey(userId, storeId),
    JSON.stringify([...otherStores, ...sources])
  );
}

export function addOrUpdateSource(userId: string, source: InventorySource): void {
  const sources = loadInventorySources(userId, source.storeId).filter(
    (s) => s.id !== source.id
  );
  sources.push(source);
  saveInventorySources(userId, sources);
}

export function removeSource(userId: string, storeId: string, sourceId: string): void {
  const sources = loadInventorySources(userId, storeId).filter((s) => s.id !== sourceId);
  saveInventorySources(userId, sources);
}

export function isCsvSource(source: InventorySource): source is CsvInventorySource {
  return source.type === "csv";
}

export function isShopifySource(source: InventorySource): source is ShopifyInventorySource {
  return source.type === "shopify";
}
