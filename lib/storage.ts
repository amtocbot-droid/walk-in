import { Product } from "./store";
import { SponsoredAd } from "./retail-media";

export type StorageMode = "local" | "server";

export interface UserData {
  stores: Array<{ id: string; name: string; plan: string }>;
  scenes: Record<string, { format: string; assetUrl: string; hotspots: unknown[] }>;
  products: Record<string, Product[]>;
  ads: Record<string, SponsoredAd[]>;
}

const LOCAL_STORAGE_KEY = "walk-in-user-data";

function getLocalData(): UserData {
  if (typeof window === "undefined") {
    return { stores: [], scenes: {}, products: {}, ads: {} };
  }

  const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!raw) {
    return { stores: [], scenes: {}, products: {}, ads: {} };
  }

  try {
    return JSON.parse(raw) as UserData;
  } catch {
    return { stores: [], scenes: {}, products: {}, ads: {} };
  }
}

function setLocalData(data: UserData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
}

export function getStorageMode(isPaid: boolean): StorageMode {
  return isPaid ? "server" : "local";
}

export async function saveUserData(
  userId: string,
  data: UserData,
  isPaid: boolean
): Promise<void> {
  const mode = getStorageMode(isPaid);

  if (mode === "server") {
    // Save to server via API
    await fetch("/api/v1/user/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, data }),
    });
  } else {
    // Save locally
    setLocalData(data);
  }
}

export async function loadUserData(userId: string, isPaid: boolean): Promise<UserData> {
  const mode = getStorageMode(isPaid);

  if (mode === "server") {
    // Load from server
    const res = await fetch(`/api/v1/user/data?userId=${encodeURIComponent(userId)}`);
    if (res.ok) {
      const body = await res.json();
      return body.data ?? { stores: [], scenes: {}, products: {}, ads: {} };
    }
    return { stores: [], scenes: {}, products: {}, ads: {} };
  }

  // Load locally
  return getLocalData();
}

export async function migrateLocalToServer(userId: string): Promise<void> {
  const localData = getLocalData();

  // Upload local data to server
  await fetch("/api/v1/user/data", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, data: localData }),
  });

  // Clear local data after successful migration
  if (typeof window !== "undefined") {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }
}

export function hasLocalData(): boolean {
  if (typeof window === "undefined") return false;
  const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
  return !!raw;
}
