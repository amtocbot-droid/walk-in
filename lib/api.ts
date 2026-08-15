const API_BASE = "/api/v1";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export const api = {
  stores: {
    list: () => request<{ stores: Array<{ id: string; name: string; url: string; plan: string }> }>("/stores"),
    create: (data: { id?: string; name: string; ownerId: string; ownerEmail?: string }) =>
      request<{ store: unknown }>("/stores", { method: "POST", body: JSON.stringify(data) }),
  },
  scene: {
    get: (storeId: string) => request<unknown>(`/stores/${storeId}/scene`),
    save: (storeId: string, scene: unknown) =>
      request<{ saved: boolean }>(`/stores/${storeId}/scene`, {
        method: "PUT",
        body: JSON.stringify(scene),
      }),
  },
  products: {
    list: (storeId: string) => request<{ products: unknown[] }>(`/stores/${storeId}/products`),
    upsert: (storeId: string, product: unknown) =>
      request<{ saved: boolean }>(`/stores/${storeId}/products`, {
        method: "POST",
        body: JSON.stringify(product),
      }),
    delete: (storeId: string, sku: string) =>
      request<{ deleted: boolean }>(`/stores/${storeId}/products`, {
        method: "DELETE",
        body: JSON.stringify({ sku }),
      }),
  },
  ads: {
    list: (storeId: string) => request<{ ads: unknown[] }>(`/stores/${storeId}/ads`),
    upsert: (storeId: string, ad: unknown) =>
      request<{ saved: boolean }>(`/stores/${storeId}/ads`, {
        method: "POST",
        body: JSON.stringify(ad),
      }),
    delete: (storeId: string, adId: string) =>
      request<{ deleted: boolean }>(`/stores/${storeId}/ads`, {
        method: "DELETE",
        body: JSON.stringify({ adId }),
      }),
  },
  analytics: {
    get: (storeId: string) => request<unknown>(`/stores/${storeId}/analytics`),
  },
  apiKeys: {
    list: (storeId: string) => request<unknown>(`/stores/${storeId}/api-keys`),
    create: (storeId: string, data: { name: string; scopes: string[] }) =>
      request<unknown>(`/stores/${storeId}/api-keys`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    delete: (storeId: string, keyId: string) =>
      request<unknown>(`/stores/${storeId}/api-keys`, {
        method: "DELETE",
        body: JSON.stringify({ keyId }),
      }),
  },
};
