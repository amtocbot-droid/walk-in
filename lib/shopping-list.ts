import { create } from "zustand";
import { Product } from "./store";
import { trackEvent } from "./telemetry";

export interface ShoppingListItem {
  product: Product;
  quantity: number;
  addedAt: string;
}

interface ShoppingListState {
  storeId: string;
  items: ShoppingListItem[];
  setStoreId: (storeId: string) => void;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (sku: string) => void;
  updateQuantity: (sku: string, quantity: number) => void;
  clearList: () => void;
}

export const useShoppingList = create<ShoppingListState>((set, get) => ({
  storeId: "demo-store",
  items: [],
  setStoreId: (storeId) => set({ storeId }),
  addItem: (product, quantity = 1) => {
    const { items, storeId } = get();
    const existing = items.find((i) => i.product.sku === product.sku);

    if (existing) {
      set({
        items: items.map((i) =>
          i.product.sku === product.sku ? { ...i, quantity: i.quantity + quantity } : i
        ),
      });
    } else {
      set({
        items: [
          ...items,
          { product, quantity, addedAt: new Date().toISOString() },
        ],
      });
    }

    trackEvent("conversion.add_to_list", {
      storeId,
      sku: product.sku,
      name: product.name,
      price: product.price,
      quantity,
    });
  },
  removeItem: (sku) => {
    const { items, storeId } = get();
    const item = items.find((i) => i.product.sku === sku);
    set({ items: items.filter((i) => i.product.sku !== sku) });
    if (item) {
      trackEvent("conversion.remove_from_list", {
        storeId,
        sku: item.product.sku,
        name: item.product.name,
      });
    }
  },
  updateQuantity: (sku, quantity) => {
    const { items } = get();
    if (quantity <= 0) {
      get().removeItem(sku);
      return;
    }
    set({
      items: items.map((i) =>
        i.product.sku === sku ? { ...i, quantity } : i
      ),
    });
  },
  clearList: () => set({ items: [] }),
}));
