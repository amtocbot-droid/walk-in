"use client";

import { useEffect, useState } from "react";
import { Product } from "@/lib/store";

interface ProductFormProps {
  product: Product | null;
  onSave: (product: Product) => void;
  onDelete: (sku: string) => void;
}

export default function ProductForm({ product, onSave, onDelete }: ProductFormProps) {
  const [form, setForm] = useState<Product>({
    sku: "",
    name: "",
    price: 0,
    currency: "USD",
    availability: "InStock",
    inventoryLevel: 0,
    aisle: "",
    shelf: "",
    coordinates: [0, 0, 0],
  });

  useEffect(() => {
    if (product) setForm(product);
  }, [product]);

  if (!product) {
    return (
      <div className="rounded-xl border border-dashed border-white/20 p-6 text-center text-sm text-slate-400">
        Select or add a hotspot to edit product details.
      </div>
    );
  }

  const update = <K extends keyof Product>(key: K, value: Product[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateCoordinate = (index: number, value: string) => {
    const num = parseFloat(value);
    setForm((prev) => {
      const coords: [number, number, number] = [...(prev.coordinates ?? [0, 0, 0])] as [
        number,
        number,
        number,
      ];
      coords[index] = Number.isNaN(num) ? 0 : num;
      return { ...prev, coordinates: coords };
    });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(form);
      }}
      className="space-y-3 rounded-xl border border-white/10 bg-slate-800/50 p-4"
    >
      <h2 className="font-semibold text-white">Edit Product</h2>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-slate-400">SKU</label>
          <input
            value={form.sku}
            onChange={(e) => update("sku", e.target.value)}
            className="w-full rounded bg-slate-900 px-2 py-1.5 text-sm text-white outline-none ring-1 ring-slate-700 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="text-xs text-slate-400">Name</label>
          <input
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className="w-full rounded bg-slate-900 px-2 py-1.5 text-sm text-white outline-none ring-1 ring-slate-700 focus:ring-brand-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-slate-400">Price</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={(e) => update("price", parseFloat(e.target.value) || 0)}
            className="w-full rounded bg-slate-900 px-2 py-1.5 text-sm text-white outline-none ring-1 ring-slate-700 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="text-xs text-slate-400">Currency</label>
          <input
            value={form.currency}
            onChange={(e) => update("currency", e.target.value)}
            className="w-full rounded bg-slate-900 px-2 py-1.5 text-sm text-white outline-none ring-1 ring-slate-700 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="text-xs text-slate-400">Stock</label>
          <input
            type="number"
            min="0"
            value={form.inventoryLevel}
            onChange={(e) => update("inventoryLevel", parseInt(e.target.value, 10) || 0)}
            className="w-full rounded bg-slate-900 px-2 py-1.5 text-sm text-white outline-none ring-1 ring-slate-700 focus:ring-brand-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-slate-400">Aisle</label>
          <input
            value={form.aisle}
            onChange={(e) => update("aisle", e.target.value)}
            className="w-full rounded bg-slate-900 px-2 py-1.5 text-sm text-white outline-none ring-1 ring-slate-700 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="text-xs text-slate-400">Shelf</label>
          <input
            value={form.shelf}
            onChange={(e) => update("shelf", e.target.value)}
            className="w-full rounded bg-slate-900 px-2 py-1.5 text-sm text-white outline-none ring-1 ring-slate-700 focus:ring-brand-500"
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-slate-400">Availability</label>
        <select
          value={form.availability}
          onChange={(e) =>
            update("availability", e.target.value as Product["availability"])
          }
          className="w-full rounded bg-slate-900 px-2 py-1.5 text-sm text-white outline-none ring-1 ring-slate-700 focus:ring-brand-500"
        >
          <option value="InStock">In Stock</option>
          <option value="LimitedAvailability">Limited</option>
          <option value="OutOfStock">Out of Stock</option>
        </select>
      </div>

      <div>
        <label className="text-xs text-slate-400">Coordinates (x, y, z)</label>
        <div className="grid grid-cols-3 gap-2">
          {([0, 1, 2] as const).map((i) => (
            <input
              key={i}
              type="number"
              step="0.1"
              value={form.coordinates?.[i] ?? 0}
              onChange={(e) => updateCoordinate(i, e.target.value)}
              className="w-full rounded bg-slate-900 px-2 py-1.5 text-sm text-white outline-none ring-1 ring-slate-700 focus:ring-brand-500"
            />
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          className="flex-1 rounded-lg bg-brand-600 py-2 text-sm font-medium hover:bg-brand-500"
        >
          Save Product
        </button>
        <button
          type="button"
          onClick={() => onDelete(form.sku)}
          className="rounded-lg bg-red-600/80 px-4 py-2 text-sm font-medium hover:bg-red-600"
        >
          Delete
        </button>
      </div>
    </form>
  );
}
