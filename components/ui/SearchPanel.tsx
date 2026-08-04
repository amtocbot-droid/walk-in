"use client";

import { useEffect, useState } from "react";
import { Product } from "@/lib/store";
import { fetchProducts, searchProducts } from "@/lib/inventory";
import { getDemoProducts } from "@/lib/demos";
import { useShoppingList } from "@/lib/shopping-list";
import { trackEvent } from "@/lib/telemetry";

interface SearchPanelProps {
  onClose: () => void;
  storeId?: string;
  demoMode?: boolean;
}

export default function SearchPanel({ onClose, storeId = "demo-store", demoMode = false }: SearchPanelProps) {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [results, setResults] = useState<Product[]>([]);
  const { addItem } = useShoppingList();

  useEffect(() => {
    if (demoMode) {
      const demoProducts = getDemoProducts(storeId);
      setProducts(demoProducts as Product[]);
    } else {
      fetchProducts(storeId).then(setProducts);
    }
  }, [storeId, demoMode]);

  useEffect(() => {
    setResults(searchProducts(query, products));
  }, [query, products]);

  const handleSelect = (p: Product) => {
    trackEvent("search.select", { storeId, sku: p.sku });
    onClose();
  };

  const handleAddToList = (e: React.MouseEvent, p: Product) => {
    e.stopPropagation();
    addItem(p);
  };

  return (
    <div className="absolute top-16 right-4 z-20 w-80 rounded-2xl border border-white/10 bg-slate-900/95 p-4 shadow-2xl backdrop-blur">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold text-white">Search Products</h2>
        <button onClick={onClose} className="text-slate-400 hover:text-white">
          ✕
        </button>
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Type a product, aisle, or shelf…"
        className="w-full rounded-lg bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none ring-1 ring-slate-700 focus:ring-brand-500"
      />
      <ul className="mt-3 max-h-64 space-y-2 overflow-auto no-scrollbar">
        {results.map((p) => (
          <li
            key={p.sku}
            className="cursor-pointer rounded-lg bg-slate-800/50 p-2 hover:bg-slate-800"
          >
            <div onClick={() => handleSelect(p)}>
              <p className="text-sm font-medium text-white">{p.name}</p>
              <p className="text-xs text-slate-400">
                ${p.price.toFixed(2)} · Aisle {p.aisle}, Shelf {p.shelf} ·{" "}
                {p.inventoryLevel} left
              </p>
            </div>
            <button
              onClick={(e) => handleAddToList(e, p)}
              className="mt-2 w-full rounded bg-brand-600 py-1 text-xs font-medium text-white hover:bg-brand-500"
            >
              Add to list
            </button>
          </li>
        ))}
        {query && results.length === 0 && (
          <li className="text-xs text-slate-500">No products found.</li>
        )}
      </ul>
    </div>
  );
}
