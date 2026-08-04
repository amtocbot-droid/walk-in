"use client";

import { useEffect, useState } from "react";

interface AnalyticsData {
  storeId: string;
  sceneLoads: number;
  searches: number;
  chatMessages: number;
  hotspotClicks: number;
  addToList: number;
  checkoutClicks: number;
  adImpressions: number;
  adClicks: number;
  adCtr: number;
  adMetrics: Array<{ adId: string; impressions: number; clicks: number; date: string }>;
}

interface AnalyticsDashboardProps {
  storeId: string;
}

export default function AnalyticsDashboard({ storeId }: AnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/v1/stores/${storeId}/analytics`)
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch((err) => console.error("Failed to load analytics:", err))
      .finally(() => setLoading(false));
  }, [storeId]);

  if (loading) {
    return (
      <div className="mt-6 rounded-xl border border-white/10 bg-slate-800/50 p-4 text-sm text-slate-400">
        Loading analytics…
      </div>
    );
  }

  if (!data) return null;

  const stats = [
    { label: "Scene loads", value: data.sceneLoads },
    { label: "Searches", value: data.searches },
    { label: "AI chats", value: data.chatMessages },
    { label: "Hotspot clicks", value: data.hotspotClicks },
    { label: "Added to list", value: data.addToList },
    { label: "Checkout clicks", value: data.checkoutClicks },
  ];

  return (
    <div className="mt-6 space-y-4 rounded-xl border border-white/10 bg-slate-800/50 p-4">
      <h3 className="font-semibold text-white">Analytics</h3>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg bg-slate-700/50 p-3">
            <p className="text-xs text-slate-400">{s.label}</p>
            <p className="text-2xl font-bold text-white">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg bg-slate-700/50 p-3">
        <p className="text-xs text-slate-400">Ad performance</p>
        <p className="text-lg font-bold text-white">
          {data.adImpressions} impressions · {data.adClicks} clicks ·{" "}
          {(data.adCtr * 100).toFixed(1)}% CTR
        </p>
      </div>

      {data.adMetrics.length > 0 && (
        <div className="max-h-32 overflow-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-slate-500">
              <tr>
                <th className="pb-1">Ad</th>
                <th className="pb-1">Date</th>
                <th className="pb-1">Impr.</th>
                <th className="pb-1">Clicks</th>
              </tr>
            </thead>
            <tbody>
              {data.adMetrics.map((m, i) => (
                <tr key={`${m.adId}-${m.date}-${i}`}>
                  <td className="py-1 font-mono">{m.adId.slice(0, 12)}…</td>
                  <td className="py-1">{m.date}</td>
                  <td className="py-1">{m.impressions}</td>
                  <td className="py-1">{m.clicks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
