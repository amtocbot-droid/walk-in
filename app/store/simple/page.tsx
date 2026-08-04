"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  price: number;
}

interface StoreData {
  name: string;
  panoramaUrl: string;
  products: Product[];
}

function StoreContent() {
  const searchParams = useSearchParams();
  const [store, setStore] = useState<StoreData | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    const custom = searchParams.get("custom");
    if (custom) {
      try {
        const data = JSON.parse(atob(custom));
        setStore(data);
      } catch (err) {
        console.error("Failed to parse store data:", err);
      }
    }
  }, [searchParams]);

  if (!store) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Store not found</h1>
          <Link href="/simple" className="text-sky-600 hover:underline">
            Create your own store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-800">{store.name}</h1>
          <Link href="/simple" className="text-sm text-sky-600 hover:underline">
            Create your own
          </Link>
        </div>
      </header>

      {/* 3D View */}
      <div className="relative h-[70vh] bg-slate-900">
        <img
          src={store.panoramaUrl}
          alt={store.name}
          className="w-full h-full object-cover"
        />

        {/* Product Hotspots */}
        {store.products.map((product, index) => (
          <button
            key={product.id}
            onClick={() => setSelectedProduct(product)}
            className="absolute w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg hover:scale-110 transition-transform"
            style={{
              left: `${20 + (index % 3) * 30}%`,
              top: `${30 + Math.floor(index / 3) * 30}%`,
            }}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {/* Product List */}
      <div className="bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Products</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {store.products.map((product, index) => (
              <div
                key={product.id}
                className={`rounded-xl border p-4 cursor-pointer transition-all ${
                  selectedProduct?.id === product.id
                    ? "border-sky-500 bg-sky-50"
                    : "border-slate-200 hover:border-sky-300"
                }`}
                onClick={() => setSelectedProduct(product)}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-800">{product.name}</h3>
                    <p className="text-lg font-bold text-sky-600">${product.price.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Product Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-800">{selectedProduct.name}</h3>
                <p className="text-2xl font-bold text-sky-600">${selectedProduct.price.toFixed(2)}</p>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <button className="w-full bg-sky-500 text-white py-3 rounded-full font-semibold hover:bg-sky-600">
              Contact to Purchase
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default function SimpleStoreViewer() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-800">Loading store…</h1>
          </div>
        </div>
      }
    >
      <StoreContent />
    </Suspense>
  );
}
