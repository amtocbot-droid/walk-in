import { create } from "zustand";

export interface Hotspot {
  id: string;
  position: [number, number, number];
  productId: string;
  label: string;
}

export interface Product {
  sku: string;
  name: string;
  price: number;
  currency: string;
  availability: "InStock" | "OutOfStock" | "LimitedAvailability";
  inventoryLevel: number;
  aisle?: string;
  shelf?: string;
  coordinates?: [number, number, number];
}

export interface Scene {
  storeId: string;
  format: "equirectangular" | "glb";
  assetUrl: string;
  hotspots: Hotspot[];
}

interface WalkInState {
  currentStore: string;
  scene: Scene | null;
  selectedProduct: Product | null;
  isLoading: boolean;
  setCurrentStore: (id: string) => void;
  setScene: (scene: Scene) => void;
  setSelectedProduct: (product: Product | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useWalkInStore = create<WalkInState>((set) => ({
  currentStore: "demo-store",
  scene: null,
  selectedProduct: null,
  isLoading: false,
  setCurrentStore: (id) => set({ currentStore: id }),
  setScene: (scene) => set({ scene }),
  setSelectedProduct: (product) => set({ selectedProduct: product }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
