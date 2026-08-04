import { Product } from "@/lib/store";

export type InventorySourceType = "owner" | "csv" | "shopify" | "square";

export interface InventorySource {
  id: string;
  storeId: string;
  type: InventorySourceType;
  label: string;
  enabled: boolean;
  lastSyncedAt?: string;
}

export interface CsvInventorySource extends InventorySource {
  type: "csv";
  data: Product[];
  uploadedAt: string;
}

export interface ShopifyInventorySource extends InventorySource {
  type: "shopify";
  shopDomain: string;
}

export type ResolvedInventory = {
  sources: InventorySource[];
  products: Product[];
  meta: {
    totalSources: number;
    lastUpdated: string;
  };
};
