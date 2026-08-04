import { Product, Hotspot } from "@/lib/store";
import { SponsoredAd, AdMetrics } from "@/lib/retail-media";

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  scopes: string[];
  createdAt: string;
  lastUsedAt?: string;
}

export interface StoredStore {
  id: string;
  ownerId: string;
  name: string;
  plan: "free" | "pro" | "enterprise";
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  apiKeys: ApiKey[];
  createdAt: string;
  updatedAt: string;
}

export interface StoredScene {
  storeId: string;
  format: "equirectangular" | "glb";
  assetUrl: string;
  hotspots: Hotspot[];
  updatedAt: string;
}

export type StoredProduct = Product & { storeId: string; updatedAt: string };

export type StoredAd = SponsoredAd & { updatedAt: string };

export type StoredAdMetrics = AdMetrics & { storeId: string };

export interface StoredTelemetryEvent {
  id: string;
  storeId: string;
  event: string;
  timestamp: string;
  payload?: Record<string, unknown>;
}
