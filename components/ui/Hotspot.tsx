"use client";

import { useState } from "react";
import { Hotspot as HotspotType, Product } from "@/lib/store";
import { fetchProduct } from "@/lib/inventory";
import { useWalkInStore } from "@/lib/store";
import { useShoppingList } from "@/lib/shopping-list";
import { trackEvent } from "@/lib/telemetry";

export default function Hotspot({ hotspot }: { hotspot: HotspotType }) {
  const [open, setOpen] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const { setSelectedProduct } = useWalkInStore();
  const { addItem } = useShoppingList();

  const handleOpen = async () => {
    setOpen(true);
    trackEvent("hotspot.opened", { productId: hotspot.productId });
    const p = await fetchProduct(hotspot.productId);
    if (p) {
      setProduct(p);
      setSelectedProduct(p);
    }
  };

  const handleAddToList = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product) {
      addItem(product);
    }
  };

  return (
    <div className="group relative flex flex-col items-center">
      <button
        onClick={handleOpen}
        onMouseEnter={handleOpen}
        onMouseLeave={() => setOpen(false)}
        className="h-4 w-4 rounded-full bg-brand-400 shadow-[0_0_12px_rgba(14,165,233,0.8)] ring-2 ring-white/50 transition-transform hover:scale-125"
        aria-label={hotspot.label}
      />
      {open && (
        <div className="absolute bottom-6 w-48 rounded-xl border border-white/10 bg-slate-900/90 p-3 text-xs text-white shadow-xl backdrop-blur">
          <p className="font-semibold">{hotspot.label}</p>
          {product && (
            <>
              <p className="mt-1 text-brand-300">${product.price.toFixed(2)}</p>
              <p className="text-slate-300">{product.inventoryLevel} in stock</p>
              <button
                onClick={handleAddToList}
                className="mt-2 w-full rounded bg-brand-600 py-1 text-xs font-medium hover:bg-brand-500"
              >
                Add to list
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
