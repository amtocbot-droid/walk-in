import { prisma } from "@/lib/prisma";
import {
  StoredStore,
  StoredScene,
  StoredProduct,
  StoredAd,
  StoredAdMetrics,
  StoredTelemetryEvent,
  ApiKey,
} from "./types";

function toStoredStore(store: {
  id: string;
  ownerId: string;
  name: string;
  plan: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  createdAt: Date;
  updatedAt: Date;
  apiKeys: Array<{
    id: string;
    name: string;
    key: string;
    scopes: string[];
    createdAt: Date;
    lastUsedAt: Date | null;
  }>;
}): StoredStore {
  return {
    id: store.id,
    ownerId: store.ownerId,
    name: store.name,
    plan: store.plan as StoredStore["plan"],
    stripeCustomerId: store.stripeCustomerId ?? undefined,
    stripeSubscriptionId: store.stripeSubscriptionId ?? undefined,
    apiKeys: store.apiKeys.map((k) => ({
      id: k.id,
      name: k.name,
      key: k.key,
      scopes: k.scopes,
      createdAt: k.createdAt.toISOString(),
      lastUsedAt: k.lastUsedAt?.toISOString(),
    })),
    createdAt: store.createdAt.toISOString(),
    updatedAt: store.updatedAt.toISOString(),
  };
}

// ---------- Stores ----------

export async function getStore(storeId: string): Promise<StoredStore | null> {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    include: { apiKeys: true },
  });
  return store ? toStoredStore(store) : null;
}

export async function listStores(ownerId?: string): Promise<StoredStore[]> {
  const stores = await prisma.store.findMany({
    where: ownerId ? { ownerId } : undefined,
    include: { apiKeys: true },
    orderBy: { createdAt: "desc" },
  });
  return stores.map(toStoredStore);
}

export async function createStore(input: { ownerId: string; name: string }): Promise<StoredStore> {
  const store = await prisma.store.create({
    data: {
      ownerId: input.ownerId,
      name: input.name,
      plan: "free",
    },
    include: { apiKeys: true },
  });
  return toStoredStore(store);
}

export async function updateStore(
  storeId: string,
  updates: Partial<StoredStore>
): Promise<StoredStore | null> {
  const data: Record<string, unknown> = {};
  if (updates.name !== undefined) data.name = updates.name;
  if (updates.plan !== undefined) data.plan = updates.plan;
  if (updates.stripeCustomerId !== undefined) data.stripeCustomerId = updates.stripeCustomerId;
  if (updates.stripeSubscriptionId !== undefined) data.stripeSubscriptionId = updates.stripeSubscriptionId;

  const store = await prisma.store.update({
    where: { id: storeId },
    data,
    include: { apiKeys: true },
  });
  return toStoredStore(store);
}

export async function deleteStore(storeId: string): Promise<boolean> {
  try {
    await prisma.store.delete({ where: { id: storeId } });
    return true;
  } catch {
    return false;
  }
}

// ---------- Scene ----------

export async function getScene(storeId: string): Promise<StoredScene | null> {
  const scene = await prisma.scene.findUnique({ where: { storeId } });
  if (!scene) return null;
  return {
    storeId: scene.storeId,
    format: scene.format as StoredScene["format"],
    assetUrl: scene.assetUrl,
    hotspots: scene.hotspots as unknown as StoredScene["hotspots"],
    updatedAt: scene.updatedAt.toISOString(),
  };
}

export async function saveScene(scene: StoredScene): Promise<void> {
  await prisma.scene.upsert({
    where: { storeId: scene.storeId },
    create: {
      storeId: scene.storeId,
      format: scene.format,
      assetUrl: scene.assetUrl,
      hotspots: scene.hotspots as unknown as Record<string, never>,
    },
    update: {
      format: scene.format,
      assetUrl: scene.assetUrl,
      hotspots: scene.hotspots as unknown as Record<string, never>,
    },
  });
}

// ---------- Products ----------

export async function getProducts(storeId: string): Promise<StoredProduct[]> {
  const products = await prisma.product.findMany({ where: { storeId } });
  return products.map((p) => ({
    sku: p.sku,
    name: p.name,
    price: p.price,
    currency: p.currency,
    availability: p.availability as StoredProduct["availability"],
    inventoryLevel: p.inventoryLevel,
    aisle: p.aisle ?? undefined,
    shelf: p.shelf ?? undefined,
    coordinates: p.coordinates as [number, number, number] | undefined,
    storeId: p.storeId,
    updatedAt: p.updatedAt.toISOString(),
  }));
}

export async function saveProducts(storeId: string, products: StoredProduct[]): Promise<void> {
  await prisma.$transaction(
    products.map((p) =>
      prisma.product.upsert({
        where: { storeId_sku: { storeId, sku: p.sku } },
        create: {
          storeId,
          sku: p.sku,
          name: p.name,
          price: p.price,
          currency: p.currency,
          availability: p.availability,
          inventoryLevel: p.inventoryLevel,
          aisle: p.aisle,
          shelf: p.shelf,
          coordinates: p.coordinates ?? [],
        },
        update: {
          name: p.name,
          price: p.price,
          currency: p.currency,
          availability: p.availability,
          inventoryLevel: p.inventoryLevel,
          aisle: p.aisle,
          shelf: p.shelf,
          coordinates: p.coordinates ?? [],
        },
      })
    )
  );
}

export async function upsertProduct(product: StoredProduct): Promise<void> {
  await prisma.product.upsert({
    where: { storeId_sku: { storeId: product.storeId, sku: product.sku } },
    create: {
      storeId: product.storeId,
      sku: product.sku,
      name: product.name,
      price: product.price,
      currency: product.currency,
      availability: product.availability,
      inventoryLevel: product.inventoryLevel,
      aisle: product.aisle,
      shelf: product.shelf,
      coordinates: product.coordinates ?? [],
    },
    update: {
      name: product.name,
      price: product.price,
      currency: product.currency,
      availability: product.availability,
      inventoryLevel: product.inventoryLevel,
      aisle: product.aisle,
      shelf: product.shelf,
      coordinates: product.coordinates ?? [],
    },
  });
}

export async function deleteProduct(storeId: string, sku: string): Promise<boolean> {
  try {
    await prisma.product.delete({ where: { storeId_sku: { storeId, sku } } });
    return true;
  } catch {
    return false;
  }
}

// ---------- Ads ----------

export async function getAds(storeId: string): Promise<StoredAd[]> {
  const ads = await prisma.ad.findMany({ where: { storeId } });
  return ads.map((a) => ({
    id: a.id,
    storeId: a.storeId,
    sponsor: a.sponsor,
    label: a.label,
    cta: a.cta,
    position: a.position as StoredAd["position"],
    productSku: a.productSku ?? undefined,
    dailyBudget: a.dailyBudget ?? undefined,
    active: a.active,
    startDate: a.startDate?.toISOString(),
    endDate: a.endDate?.toISOString(),
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  }));
}

export async function saveAds(storeId: string, ads: StoredAd[]): Promise<void> {
  await prisma.$transaction(
    ads.map((a) =>
      prisma.ad.upsert({
        where: { id: a.id },
        create: {
          id: a.id,
          storeId,
          sponsor: a.sponsor,
          label: a.label,
          cta: a.cta,
          position: a.position,
          productSku: a.productSku,
          dailyBudget: a.dailyBudget,
          active: a.active,
          startDate: a.startDate ? new Date(a.startDate) : null,
          endDate: a.endDate ? new Date(a.endDate) : null,
        },
        update: {
          sponsor: a.sponsor,
          label: a.label,
          cta: a.cta,
          position: a.position,
          productSku: a.productSku,
          dailyBudget: a.dailyBudget,
          active: a.active,
          startDate: a.startDate ? new Date(a.startDate) : null,
          endDate: a.endDate ? new Date(a.endDate) : null,
        },
      })
    )
  );
}

export async function upsertAd(ad: StoredAd): Promise<void> {
  await prisma.ad.upsert({
    where: { id: ad.id },
    create: {
      id: ad.id,
      storeId: ad.storeId,
      sponsor: ad.sponsor,
      label: ad.label,
      cta: ad.cta,
      position: ad.position,
      productSku: ad.productSku,
      dailyBudget: ad.dailyBudget,
      active: ad.active,
      startDate: ad.startDate ? new Date(ad.startDate) : null,
      endDate: ad.endDate ? new Date(ad.endDate) : null,
    },
    update: {
      sponsor: ad.sponsor,
      label: ad.label,
      cta: ad.cta,
      position: ad.position,
      productSku: ad.productSku,
      dailyBudget: ad.dailyBudget,
      active: ad.active,
      startDate: ad.startDate ? new Date(ad.startDate) : null,
      endDate: ad.endDate ? new Date(ad.endDate) : null,
    },
  });
}

export async function deleteAd(storeId: string, adId: string): Promise<boolean> {
  try {
    await prisma.ad.delete({ where: { id: adId } });
    return true;
  } catch {
    return false;
  }
}

// ---------- Ad Metrics ----------

export async function getAdMetrics(storeId: string): Promise<StoredAdMetrics[]> {
  const metrics = await prisma.adMetric.findMany({ where: { storeId } });
  return metrics.map((m) => ({
    adId: m.adId,
    storeId: m.storeId,
    impressions: m.impressions,
    clicks: m.clicks,
    date: m.date,
  }));
}

export async function trackAdMetric(
  storeId: string,
  adId: string,
  type: "impressions" | "clicks"
): Promise<void> {
  const date = new Date().toISOString().slice(0, 10);
  await prisma.adMetric.upsert({
    where: { adId_date: { adId, date } },
    create: { storeId, adId, date, [type]: 1 },
    update: { [type]: { increment: 1 } },
  });
}

// ---------- Telemetry ----------

export async function appendTelemetryEvents(
  events: Omit<StoredTelemetryEvent, "id">[]
): Promise<void> {
  await prisma.telemetryEvent.createMany({
    data: events.map((e) => ({
      storeId: e.storeId,
      event: e.event,
      payload: (e.payload ?? {}) as Record<string, never>,
      timestamp: new Date(e.timestamp),
    })),
  });
}

export async function getTelemetryEvents(storeId?: string): Promise<StoredTelemetryEvent[]> {
  const events = await prisma.telemetryEvent.findMany({
    where: storeId ? { storeId } : undefined,
    orderBy: { timestamp: "desc" },
    take: 10000,
  });
  return events.map((e) => ({
    id: e.id,
    storeId: e.storeId,
    event: e.event,
    timestamp: e.timestamp.toISOString(),
    payload: e.payload as Record<string, unknown> | undefined,
  }));
}

// ---------- API Keys ----------

export async function addApiKey(
  storeId: string,
  key: Omit<ApiKey, "id" | "createdAt">
): Promise<ApiKey | null> {
  try {
    const apiKey = await prisma.apiKey.create({
      data: {
        storeId,
        name: key.name,
        key: key.key,
        scopes: key.scopes,
      },
    });
    return {
      id: apiKey.id,
      name: apiKey.name,
      key: apiKey.key,
      scopes: apiKey.scopes,
      createdAt: apiKey.createdAt.toISOString(),
      lastUsedAt: apiKey.lastUsedAt?.toISOString(),
    };
  } catch {
    return null;
  }
}

export async function revokeApiKey(storeId: string, keyId: string): Promise<boolean> {
  try {
    await prisma.apiKey.delete({ where: { id: keyId } });
    return true;
  } catch {
    return false;
  }
}

export async function validateApiKey(storeId: string, key: string): Promise<boolean> {
  const apiKey = await prisma.apiKey.findFirst({
    where: { storeId, key },
  });
  if (!apiKey) return false;

  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  });
  return true;
}

export * from "./types";
