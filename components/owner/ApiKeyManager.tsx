"use client";

import { useEffect, useState } from "react";
import { ApiKey } from "@/lib/db/types";

interface ApiKeyManagerProps {
  storeId: string;
}

export default function ApiKeyManager({ storeId }: ApiKeyManagerProps) {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [name, setName] = useState("");
  const [scopes, setScopes] = useState("read:scenes read:inventory read:guidance");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void loadKeys();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId]);

  const loadKeys = async () => {
    try {
      const res = await fetch(`/api/v1/stores/${storeId}/api-keys`);
      if (res.ok) {
        const data = await res.json();
        setKeys(data.apiKeys ?? []);
      }
    } catch (err) {
      console.error("Failed to load API keys:", err);
    }
  };

  const createKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/stores/${storeId}/api-keys`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), scopes: scopes.split(" ").filter(Boolean) }),
      });
      if (res.ok) {
        setName("");
        await loadKeys();
      }
    } catch (err) {
      console.error("Failed to create API key:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteKey = async (keyId: string) => {
    if (!confirm("Revoke this API key?")) return;
    try {
      await fetch(`/api/v1/stores/${storeId}/api-keys`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyId }),
      });
      await loadKeys();
    } catch (err) {
      console.error("Failed to delete API key:", err);
    }
  };

  return (
    <div className="mt-6 space-y-3 rounded-xl border border-white/10 bg-slate-800/50 p-4">
      <h3 className="font-semibold text-white">API Keys</h3>
      <p className="text-xs text-slate-400">
        Issue keys for robots and integrations to access this store&apos;s scene, products, and guide API.
      </p>

      <form onSubmit={createKey} className="space-y-2">
        <input
          type="text"
          placeholder="Key name (e.g., Robot integration)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg bg-slate-700 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none"
        />
        <input
          type="text"
          placeholder="Scopes (space separated)"
          value={scopes}
          onChange={(e) => setScopes(e.target.value)}
          className="w-full rounded-lg bg-slate-700 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none"
        />
        <button
          type="submit"
          disabled={!name.trim() || loading}
          className="w-full rounded-lg bg-brand-600 py-2 text-sm font-medium text-white hover:bg-brand-500 disabled:opacity-50"
        >
          {loading ? "Creating…" : "Create API Key"}
        </button>
      </form>

      {keys.length > 0 && (
        <ul className="space-y-2">
          {keys.map((k) => (
            <li key={k.id} className="rounded-lg border border-white/10 bg-slate-800/50 p-3 text-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-white">{k.name}</p>
                  <p className="mt-1 font-mono text-xs text-slate-400">{k.key}</p>
                  <p className="text-xs text-slate-500">{k.scopes.join(" ")}</p>
                  {k.lastUsedAt && (
                    <p className="text-xs text-slate-500">Last used: {new Date(k.lastUsedAt).toLocaleString()}</p>
                  )}
                </div>
                <button
                  onClick={() => deleteKey(k.id)}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Revoke
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
