"use client";

import { useShoppingList } from "@/lib/shopping-list";
import { trackEvent } from "@/lib/telemetry";

interface ShoppingListPanelProps {
  onClose: () => void;
}

export default function ShoppingListPanel({ onClose }: ShoppingListPanelProps) {
  const { items, storeId, updateQuantity, removeItem, clearList } = useShoppingList();

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleCheckout = () => {
    trackEvent("conversion.checkout_click", {
      storeId,
      itemCount: items.length,
      total: total.toFixed(2),
    });
    // In production, deep-link to store POS/e-commerce or open checkout.
    alert(`Checkout would open here. Total: $${total.toFixed(2)}`);
  };

  return (
    <div className="absolute bottom-20 left-4 z-20 flex h-[28rem] w-80 flex-col rounded-2xl border border-white/10 bg-slate-900/95 shadow-2xl backdrop-blur">
      <div className="flex items-center justify-between border-b border-white/10 p-4">
        <h2 className="font-semibold text-white">Shopping List</h2>
        <div className="flex gap-2">
          {items.length > 0 && (
            <button
              onClick={clearList}
              className="text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-auto p-4 no-scrollbar">
        {items.length === 0 ? (
          <p className="text-sm text-slate-500">Your shopping list is empty.</p>
        ) : (
          items.map((item) => (
            <div
              key={item.product.sku}
              className="rounded-xl bg-slate-800 p-3 text-sm text-slate-100"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{item.product.name}</p>
                  <p className="text-xs text-slate-400">
                    ${item.product.price.toFixed(2)} · Aisle {item.product.aisle}, Shelf {item.product.shelf}
                  </p>
                </div>
                <button
                  onClick={() => removeItem(item.product.sku)}
                  className="text-red-400 hover:text-red-300"
                >
                  ✕
                </button>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.product.sku, item.quantity - 1)}
                  className="rounded bg-slate-700 px-2 py-1 text-xs hover:bg-slate-600"
                >
                  −
                </button>
                <span className="text-sm">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.product.sku, item.quantity + 1)}
                  className="rounded bg-slate-700 px-2 py-1 text-xs hover:bg-slate-600"
                >
                  +
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="border-t border-white/10 p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm text-slate-400">Total</span>
          <span className="text-lg font-bold text-white">${total.toFixed(2)}</span>
        </div>
        <button
          onClick={handleCheckout}
          disabled={items.length === 0}
          className="w-full rounded-lg bg-brand-600 py-2 text-sm font-medium text-white hover:bg-brand-500 disabled:opacity-50"
        >
          Checkout
        </button>
      </div>
    </div>
  );
}
