import { Product } from "./store";
import { resolveInventory } from "./inventory-sources";

// Demo inventory used when no owner scene or connected sources exist.
const DEMO_PRODUCTS: Product[] = [
  {
    sku: "sku_milk",
    name: "Organic Whole Milk 1L",
    price: 3.49,
    currency: "USD",
    availability: "InStock",
    inventoryLevel: 14,
    aisle: "3",
    shelf: "B",
    coordinates: [1.2, 0, -3.5],
  },
  {
    sku: "sku_bread",
    name: "Sourdough Loaf",
    price: 5.99,
    currency: "USD",
    availability: "LimitedAvailability",
    inventoryLevel: 3,
    aisle: "2",
    shelf: "A",
    coordinates: [-2.1, 0, -1.2],
  },
  {
    sku: "sku_coffee",
    name: "Dark Roast Coffee Beans",
    price: 12.99,
    currency: "USD",
    availability: "InStock",
    inventoryLevel: 28,
    aisle: "4",
    shelf: "C",
    coordinates: [0.5, 0, 2.4],
  },
  {
    sku: "sku_eggs",
    name: "Free-Range Eggs Dozen",
    price: 4.29,
    currency: "USD",
    availability: "InStock",
    inventoryLevel: 42,
    aisle: "3",
    shelf: "A",
    coordinates: [1.5, 0, -3.2],
  },
];

export async function fetchProducts(
  storeId: string,
  userId?: string
): Promise<Product[]> {
  await new Promise((r) => setTimeout(r, 300));

  // Owner store / demo store: use configured sources if any exist.
  if ((storeId === "owner-store" || storeId === "demo-store") && userId) {
    const resolved = await resolveInventory(userId, storeId);
    if (resolved.products.length > 0) {
      return applyStockJitter(resolved.products);
    }
  }

  // In production, fetch from the store's connected sources via server.
  void storeId;
  void userId;
  return applyStockJitter(DEMO_PRODUCTS);
}

export async function fetchProduct(
  sku: string,
  userId?: string
): Promise<Product | undefined> {
  const products = await fetchProducts("demo-store", userId);
  return products.find((p) => p.sku === sku);
}

export function searchProducts(query: string, products: Product[]): Product[] {
  const q = query.toLowerCase();
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.aisle?.toLowerCase().includes(q) ||
      p.shelf?.toLowerCase().includes(q)
  );
}

function applyStockJitter(products: Product[]): Product[] {
  return products.map((p) => ({
    ...p,
    inventoryLevel: Math.max(0, p.inventoryLevel + Math.floor(Math.random() * 3) - 1),
  }));
}
