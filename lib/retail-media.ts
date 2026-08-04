import { api } from "./api";

export interface SponsoredAd {
  id: string;
  storeId: string;
  sponsor: string;
  label: string;
  cta: string;
  position: "top" | "inline" | "hotspot";
  /** Optional product SKU to link the ad to a hotspot. */
  productSku?: string;
  /** Optional daily impression budget. */
  dailyBudget?: number;
  /** Whether the ad is currently active. */
  active: boolean;
  /** ISO date string. */
  startDate?: string;
  /** ISO date string. */
  endDate?: string;
  createdAt: string;
}

export interface AdMetrics {
  adId: string;
  impressions: number;
  clicks: number;
  /** ISO date string. */
  date: string;
}

function adsKey(storeId: string): string {
  return `walk-in-ads-${storeId}`;
}

function metricsKey(storeId: string): string {
  return `walk-in-ad-metrics-${storeId}`;
}

export function loadAds(storeId: string): SponsoredAd[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(adsKey(storeId));
  if (!raw) return [];
  try {
    return JSON.parse(raw) as SponsoredAd[];
  } catch {
    return [];
  }
}

export function saveAd(ad: SponsoredAd): void {
  if (typeof window === "undefined") return;
  const ads = loadAds(ad.storeId).filter((a) => a.id !== ad.id);
  ads.push(ad);
  localStorage.setItem(adsKey(ad.storeId), JSON.stringify(ads));

  void api.ads.upsert(ad.storeId, ad).catch((err) => console.error("Ad sync failed:", err));
}

export function deleteAd(storeId: string, adId: string): void {
  if (typeof window === "undefined") return;
  const ads = loadAds(storeId).filter((a) => a.id !== adId);
  localStorage.setItem(adsKey(storeId), JSON.stringify(ads));

  void api.ads.delete(storeId, adId).catch((err) => console.error("Ad delete sync failed:", err));
}

export function getActiveAds(storeId: string): SponsoredAd[] {
  const now = new Date().toISOString();
  return loadAds(storeId).filter((ad) => {
    if (!ad.active) return false;
    if (ad.startDate && now < ad.startDate) return false;
    if (ad.endDate && now > ad.endDate) return false;
    return true;
  });
}

export function trackAdImpression(adId: string, storeId: string): void {
  trackAdMetric(adId, storeId, "impressions");
}

export function trackAdClick(adId: string, storeId: string): void {
  trackAdMetric(adId, storeId, "clicks");
}

function trackAdMetric(adId: string, storeId: string, type: "impressions" | "clicks"): void {
  if (typeof window === "undefined") return;
  const key = metricsKey(storeId);
  const date = new Date().toISOString().slice(0, 10);
  const metrics: AdMetrics[] = JSON.parse(localStorage.getItem(key) ?? "[]");

  let metric = metrics.find((m) => m.adId === adId && m.date === date);
  if (!metric) {
    metric = { adId, impressions: 0, clicks: 0, date };
    metrics.push(metric);
  }
  metric[type] += 1;
  localStorage.setItem(key, JSON.stringify(metrics));

  // Telemetry events handle server-side aggregation.
}

export function loadAdMetrics(storeId: string): AdMetrics[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(metricsKey(storeId));
  if (!raw) return [];
  try {
    return JSON.parse(raw) as AdMetrics[];
  } catch {
    return [];
  }
}
