"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import PanoramaUploader from "@/components/owner/PanoramaUploader";
import HotspotEditor from "@/components/owner/HotspotEditor";
import ProductForm from "@/components/owner/ProductForm";
import CsvUploader from "@/components/owner/CsvUploader";
import PhotoSetUploader from "@/components/owner/PhotoSetUploader";
import ProcessingJobs from "@/components/owner/ProcessingJobs";
import RetailMediaManager from "@/components/owner/RetailMediaManager";
import ApiKeyManager from "@/components/owner/ApiKeyManager";
import AnalyticsDashboard from "@/components/owner/AnalyticsDashboard";
import SkyboxGenerator from "@/components/owner/SkyboxGenerator";
import StreetViewUploader from "@/components/owner/StreetViewUploader";
import { ProcessingJob, loadJobs } from "@/lib/photogrammetry";
import {
  OwnerSceneConfig,
  createDefaultScene,
  loadOwnerScene,
  saveOwnerScene,
} from "@/lib/scene-config";
import {
  InventorySource,
  loadInventorySources,
  removeSource,
} from "@/lib/inventory-sources";
import { Store, loadStores, createStore, deleteStore } from "@/lib/stores";
import { canAddProduct, canCreateStore, getPlan } from "@/lib/billing/plans";
import Link from "next/link";
import { Product } from "@/lib/store";

export default function OwnerDashboard() {
  const { data: session, status } = useSession();
  const userId = session?.user?.id;

  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [config, setConfig] = useState<OwnerSceneConfig | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [sources, setSources] = useState<InventorySource[]>([]);
  const [jobs, setJobs] = useState<ProcessingJob[]>([]);
  const [saved, setSaved] = useState(false);
  const [newStoreName, setNewStoreName] = useState("");

  // Load stores once session is available.
  useEffect(() => {
    if (!userId) return;
    const list = loadStores(userId);
    setStores(list);
    if (list.length > 0 && !selectedStoreId) {
      setSelectedStoreId(list[0].id);
    }
  }, [userId, selectedStoreId]);

  // Load scene + sources for selected store.
  useEffect(() => {
    if (!userId || !selectedStoreId) return;
    const existing = loadOwnerScene(userId, selectedStoreId);
    const store = stores.find((s) => s.id === selectedStoreId);
    setConfig(
      existing ?? {
        ...createDefaultScene(userId, selectedStoreId),
        storeName: store?.name ?? "My Store",
      }
    );
    setSources(loadInventorySources(userId, selectedStoreId));
    setJobs(loadJobs(userId, selectedStoreId));
    setSelectedProduct(null);
  }, [userId, selectedStoreId, stores]);

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
        Loading…
      </div>
    );
  }

  if (!userId || !config) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
        Please sign in to access the owner dashboard.
      </div>
    );
  }

  const refreshSources = () => {
    if (!selectedStoreId) return;
    setSources(loadInventorySources(userId, selectedStoreId));
  };

  const refreshJobs = () => {
    if (!selectedStoreId) return;
    setJobs(loadJobs(userId, selectedStoreId));
  };

  const updateConfig = (next: Partial<OwnerSceneConfig>) => {
    setConfig((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...next };
      saveOwnerScene(updated);
      return updated;
    });
    setSaved(false);
  };

  const addProduct = (product: Product) => {
    if (!config) return;
    const currentStore = stores.find((s) => s.id === selectedStoreId);
    const plan = currentStore?.plan ?? "free";

    if (!existsSku(config.products, product.sku) && !canAddProduct(config.products.length, plan)) {
      alert(`Your ${getPlan(plan).name} plan allows up to ${getPlan(plan).maxSkus} SKUs. Upgrade to add more.`);
      return;
    }

    const exists = existsSku(config.products, product.sku);
    const products = exists
      ? config.products.map((p) => (p.sku === product.sku ? product : p))
      : [...config.products, product];
    updateConfig({ products });
    setSelectedProduct(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const deleteProduct = (sku: string) => {
    if (!config) return;
    updateConfig({ products: config.products.filter((p) => p.sku !== sku) });
    if (selectedProduct?.sku === sku) setSelectedProduct(null);
  };

  const handleCreateStore = () => {
    if (!userId || !newStoreName.trim()) return;
    const plan = stores[0]?.plan ?? "free";

    if (!canCreateStore(stores.length, plan)) {
      alert(`Your ${getPlan(plan).name} plan allows up to ${getPlan(plan).maxStores} stores. Upgrade to add more.`);
      return;
    }

    const store = createStore(userId, newStoreName.trim());
    setStores(loadStores(userId));
    setSelectedStoreId(store.id);
    setNewStoreName("");
  };

  const handleDeleteStore = (storeId: string) => {
    if (!userId) return;
    if (!confirm("Delete this store? This cannot be undone.")) return;
    deleteStore(userId, storeId);
    const remaining = loadStores(userId);
    setStores(remaining);
    setSelectedStoreId(remaining[0]?.id ?? null);
  };

  return (
    <main className="flex h-screen flex-col bg-slate-50 text-slate-800">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Owner Dashboard</h1>
          <p className="text-sm text-slate-500">Build your 3D walk-in experiences</p>
        </div>
        <div className="flex items-center gap-4">
          {saved && <span className="text-sm text-emerald-600">Saved</span>}
          {selectedStoreId && (
            <Link
              href={`/store?id=${selectedStoreId}`}
              className="rounded-full bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600"
            >
              Preview Store
            </Link>
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/signin" })}
            className="rounded-full bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-300"
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="border-b border-slate-200 bg-white px-6 py-3">
        <div className="flex items-center gap-4">
          <label className="text-sm text-slate-600">Store:</label>
          <select
            value={selectedStoreId ?? ""}
            onChange={(e) => setSelectedStoreId(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 outline-none"
          >
            {stores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newStoreName}
              onChange={(e) => setNewStoreName(e.target.value)}
              placeholder="New store name"
              className="rounded-lg bg-slate-800 px-3 py-1.5 text-sm text-white placeholder-slate-500 outline-none ring-1 ring-slate-700"
            />
            <button
              onClick={handleCreateStore}
              disabled={!newStoreName.trim()}
              className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium hover:bg-brand-500 disabled:opacity-50"
            >
              Create
            </button>
          </div>

          {selectedStoreId && (
            <button
              onClick={() => handleDeleteStore(selectedStoreId)}
              className="ml-auto text-xs text-red-400 hover:text-red-300"
            >
              Delete store
            </button>
          )}
        </div>
      </div>

      {selectedStoreId ? (
        <div className="flex flex-1 overflow-hidden">
          <section className="flex flex-1 flex-col border-r border-white/10">
            <div className="border-b border-white/10 p-4">
              <PanoramaUploader
                url={config.panoramaUrl}
                onChange={(url) => updateConfig({ panoramaUrl: url })}
              />
            </div>
            <div className="relative flex-1 overflow-hidden bg-black">
              {config.panoramaUrl ? (
                <HotspotEditor
                  panoramaUrl={config.panoramaUrl}
                  products={config.products}
                  selectedSku={selectedProduct?.sku}
                  onSelect={setSelectedProduct}
                  onAdd={(product) => {
                    setSelectedProduct(product);
                  }}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-slate-500">
                  Upload a 360° panorama to start placing products.
                </div>
              )}
            </div>
          </section>

          <aside className="w-96 overflow-y-auto border-l border-white/10 bg-slate-900/50 p-4">
            <ProductForm
              product={selectedProduct}
              onSave={addProduct}
              onDelete={deleteProduct}
            />

            <div className="mt-6">
              <SkyboxGenerator
                onGenerated={(imageUrl) => updateConfig({ panoramaUrl: imageUrl })}
              />
            </div>

            <div className="mt-6">
              <StreetViewUploader
                onUploaded={(imageUrl) => updateConfig({ panoramaUrl: imageUrl })}
              />
            </div>

            <div className="mt-6">
              <CsvUploader
                userId={userId}
                storeId={selectedStoreId}
                onUpload={refreshSources}
              />
            </div>

            <div className="mt-6">
              <PhotoSetUploader
                userId={userId}
                storeId={selectedStoreId}
                plan={stores.find((s) => s.id === selectedStoreId)?.plan ?? "free"}
                onJobStarted={refreshJobs}
                onComplete={(meshUrl) => updateConfig({ meshUrl })}
              />
            </div>

            <ProcessingJobs userId={userId} storeId={selectedStoreId} jobs={jobs} />

            <RetailMediaManager
              storeId={selectedStoreId}
              products={config.products}
              plan={stores.find((s) => s.id === selectedStoreId)?.plan ?? "free"}
            />

            <ApiKeyManager storeId={selectedStoreId} />

            <AnalyticsDashboard storeId={selectedStoreId} />

            {sources.length > 0 && (
              <div className="mt-6">
                <h3 className="mb-2 text-sm font-semibold text-slate-300">
                  Inventory Sources
                </h3>
                <ul className="space-y-2">
                  {sources.map((s) => (
                    <li
                      key={s.id}
                      className="flex items-center justify-between rounded-lg border border-white/10 bg-slate-800/50 p-3 text-sm"
                    >
                      <div>
                        <p className="font-medium">{s.label}</p>
                        <p className="text-xs text-slate-400 capitalize">{s.type}</p>
                      </div>
                      <button
                        onClick={() => {
                          removeSource(userId, selectedStoreId, s.id);
                          refreshSources();
                        }}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-6">
              <h3 className="mb-2 text-sm font-semibold text-slate-300">
                Products ({config.products.length})
              </h3>
              <ul className="space-y-2">
                {config.products.map((p) => (
                  <li
                    key={p.sku}
                    onClick={() => setSelectedProduct(p)}
                    className={`cursor-pointer rounded-lg border p-3 text-sm transition-colors ${
                      selectedProduct?.sku === p.sku
                        ? "border-brand-500 bg-brand-900/20"
                        : "border-white/10 bg-slate-800/50 hover:bg-slate-800"
                    }`}
                  >
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-slate-400">
                      ${p.price.toFixed(2)} · {p.inventoryLevel} left · Aisle {p.aisle}
                    </p>
                  </li>
                ))}
                {config.products.length === 0 && (
                  <li className="text-xs text-slate-500">
                    No products yet. Click the panorama to add one.
                  </li>
                )}
              </ul>
            </div>
          </aside>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center text-slate-500">
          Create a store to get started.
        </div>
      )}
    </main>
  );
}

function existsSku(products: Product[], sku: string): boolean {
  return products.some((p) => p.sku === sku);
}
