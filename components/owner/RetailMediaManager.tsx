"use client";

import { useEffect, useState } from "react";
import {
  SponsoredAd,
  AdMetrics,
  loadAds,
  saveAd,
  deleteAd,
  loadAdMetrics,
} from "@/lib/retail-media";
import { Product } from "@/lib/store";

interface RetailMediaManagerProps {
  storeId: string;
  products: Product[];
  plan?: "free" | "pro" | "enterprise";
}

export default function RetailMediaManager({ storeId, products, plan = "free" }: RetailMediaManagerProps) {
  const [ads, setAds] = useState<SponsoredAd[]>([]);
  const [metrics, setMetrics] = useState<AdMetrics[]>([]);
  const [form, setForm] = useState<Partial<SponsoredAd>>({
    position: "inline",
    active: true,
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    setAds(loadAds(storeId));
    setMetrics(loadAdMetrics(storeId));
  }, [storeId]);

  const refresh = () => {
    setAds(loadAds(storeId));
    setMetrics(loadAdMetrics(storeId));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.sponsor || !form.label || !form.cta || !form.position) return;

    const ad: SponsoredAd = {
      id: editingId ?? `ad_${Date.now()}`,
      storeId,
      sponsor: form.sponsor,
      label: form.label,
      cta: form.cta,
      position: form.position,
      productSku: form.productSku,
      dailyBudget: form.dailyBudget,
      active: form.active ?? true,
      startDate: form.startDate,
      endDate: form.endDate,
      createdAt: editingId ? ads.find((a) => a.id === editingId)?.createdAt ?? new Date().toISOString() : new Date().toISOString(),
    };

    saveAd(ad);
    setForm({ position: "inline", active: true });
    setEditingId(null);
    refresh();
  };

  const handleEdit = (ad: SponsoredAd) => {
    setForm({ ...ad });
    setEditingId(ad.id);
  };

  const handleDelete = (adId: string) => {
    if (!confirm("Delete this sponsored placement?")) return;
    deleteAd(storeId, adId);
    refresh();
  };

  const getMetrics = (adId: string) => {
    return metrics
      .filter((m) => m.adId === adId)
      .reduce(
        (acc, m) => ({ impressions: acc.impressions + m.impressions, clicks: acc.clicks + m.clicks }),
        { impressions: 0, clicks: 0 }
      );
  };

  if (plan === "free") {
    return (
      <div className="mt-6 space-y-2 rounded-xl border border-amber-500/30 bg-amber-950/30 p-4">
        <h3 className="font-semibold text-white">Retail Media</h3>
        <p className="text-xs text-amber-200">
          Sponsored placements are available on Pro and Enterprise plans. Upgrade to create ads and
          monetize shopper traffic.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4 rounded-xl border border-white/10 bg-slate-800/50 p-4">
      <h3 className="font-semibold text-white">Retail Media</h3>
      <p className="text-xs text-slate-400">
        Create sponsored placements that appear in the 3D scene. Impressions and clicks are
        tracked locally and forwarded through the configured telemetry provider.
      </p>

      <form onSubmit={handleSave} className="space-y-3">
        <input
          type="text"
          placeholder="Sponsor name"
          value={form.sponsor ?? ""}
          onChange={(e) => setForm({ ...form, sponsor: e.target.value })}
          className="w-full rounded-lg bg-slate-700 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none"
          required
        />
        <input
          type="text"
          placeholder="Ad headline"
          value={form.label ?? ""}
          onChange={(e) => setForm({ ...form, label: e.target.value })}
          className="w-full rounded-lg bg-slate-700 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none"
          required
        />
        <input
          type="text"
          placeholder="Call to action"
          value={form.cta ?? ""}
          onChange={(e) => setForm({ ...form, cta: e.target.value })}
          className="w-full rounded-lg bg-slate-700 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none"
          required
        />

        <div className="grid grid-cols-2 gap-2">
          <select
            value={form.position ?? "inline"}
            onChange={(e) =>
              setForm({ ...form, position: e.target.value as SponsoredAd["position"] })
            }
            className="rounded-lg bg-slate-700 px-3 py-2 text-sm text-white outline-none"
          >
            <option value="top">Top banner</option>
            <option value="inline">Inline card</option>
            <option value="hotspot">Hotspot</option>
          </select>

          <select
            value={form.productSku ?? ""}
            onChange={(e) => setForm({ ...form, productSku: e.target.value || undefined })}
            className="rounded-lg bg-slate-700 px-3 py-2 text-sm text-white outline-none"
          >
            <option value="">No product link</option>
            {products.map((p) => (
              <option key={p.sku} value={p.sku}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <input
            type="date"
            value={form.startDate ? form.startDate.slice(0, 10) : ""}
            onChange={(e) => setForm({ ...form, startDate: e.target.value || undefined })}
            className="rounded-lg bg-slate-700 px-3 py-2 text-sm text-white outline-none"
          />
          <input
            type="date"
            value={form.endDate ? form.endDate.slice(0, 10) : ""}
            onChange={(e) => setForm({ ...form, endDate: e.target.value || undefined })}
            className="rounded-lg bg-slate-700 px-3 py-2 text-sm text-white outline-none"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={form.active ?? true}
            onChange={(e) => setForm({ ...form, active: e.target.checked })}
          />
          Active
        </label>

        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 rounded-lg bg-brand-600 py-2 text-sm font-medium text-white hover:bg-brand-500"
          >
            {editingId ? "Update Ad" : "Create Ad"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm({ position: "inline", active: true });
              }}
              className="rounded-lg bg-slate-700 px-3 py-2 text-sm text-white hover:bg-slate-600"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {ads.length > 0 && (
        <ul className="space-y-2">
          {ads.map((ad) => {
            const stats = getMetrics(ad.id);
            return (
              <li
                key={ad.id}
                className="rounded-lg border border-white/10 bg-slate-800/50 p-3 text-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-white">{ad.label}</p>
                    <p className="text-xs text-slate-400">
                      {ad.sponsor} · {ad.position} · {ad.active ? "active" : "paused"}
                    </p>
                    <p className="mt-1 text-xs text-brand-300">
                      {stats.impressions} impressions · {stats.clicks} clicks
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(ad)}
                      className="text-xs text-brand-400 hover:text-brand-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(ad.id)}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
