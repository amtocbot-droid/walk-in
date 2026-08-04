import { Product } from "@/lib/store";
import { CsvInventorySource } from "./types";
import { addOrUpdateSource } from "./storage";

export const CSV_TEMPLATE = `sku,name,price,currency,inventoryLevel,availability,aisle,shelf
sku_milk,Organic Whole Milk 1L,3.49,USD,14,InStock,3,B
sku_bread,Sourdough Loaf,5.99,USD,3,LimitedAvailability,2,A
sku_coffee,Dark Roast Coffee Beans,12.99,USD,28,InStock,4,C
sku_eggs,Free-Range Eggs Dozen,4.29,USD,42,InStock,3,A`;

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().replace(/\s+/g, "");
}

function parseAvailability(value?: string): Product["availability"] {
  if (!value) return "InStock";
  const v = value.trim().toLowerCase();
  if (v === "outofstock" || v === "out of stock") return "OutOfStock";
  if (v === "limitedavailability" || v === "limited") return "LimitedAvailability";
  return "InStock";
}

export function parseCsvProducts(csvText: string): Product[] {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map(normalizeHeader);
  const idx = (name: string) => headers.indexOf(normalizeHeader(name));

  const skuIdx = idx("sku");
  const nameIdx = idx("name");
  const priceIdx = idx("price");
  const currencyIdx = idx("currency");
  const stockIdx = idx("inventorylevel") ?? idx("stock");
  const availabilityIdx = idx("availability");
  const aisleIdx = idx("aisle");
  const shelfIdx = idx("shelf");

  if (skuIdx === -1 || nameIdx === -1) {
    throw new Error("CSV must contain at least 'sku' and 'name' columns.");
  }

  return lines.slice(1).map((line) => {
    // Simple CSV parsing; does not handle escaped commas inside quotes.
    const cells = line.split(",");
    return {
      sku: cells[skuIdx]?.trim() ?? "",
      name: cells[nameIdx]?.trim() ?? "",
      price: parseFloat(cells[priceIdx] ?? "0") || 0,
      currency: (cells[currencyIdx] ?? "USD").trim() || "USD",
      inventoryLevel: parseInt(cells[stockIdx] ?? "0", 10) || 0,
      availability: parseAvailability(cells[availabilityIdx]),
      aisle: (cells[aisleIdx] ?? "").trim() || undefined,
      shelf: (cells[shelfIdx] ?? "").trim() || undefined,
    };
  });
}

export function saveCsvSource(
  userId: string,
  storeId: string,
  label: string,
  products: Product[]
): CsvInventorySource {
  const source: CsvInventorySource = {
    id: `csv_${Date.now()}`,
    storeId,
    type: "csv",
    label,
    enabled: true,
    data: products,
    uploadedAt: new Date().toISOString(),
  };
  addOrUpdateSource(userId, source);
  return source;
}
