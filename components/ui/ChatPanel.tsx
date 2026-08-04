"use client";

import { useEffect, useRef, useState } from "react";
import { getAiProviderName, GuideResponse } from "@/lib/ai";
import { fetchProducts } from "@/lib/inventory";
import { Product } from "@/lib/store";
import { trackEvent } from "@/lib/telemetry";

interface Message {
  role: "user" | "assistant";
  text: string;
  response?: GuideResponse;
}

export default function ChatPanel({
  onClose,
  initialQuery,
}: {
  onClose: () => void;
  initialQuery?: string;
}) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Hi! Ask me where to find anything in the store.",
    },
  ]);
  const [input, setInput] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [provider] = useState(() => getAiProviderName());
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchProducts("demo-store").then(setProducts);
  }, []);

  useEffect(() => {
    if (initialQuery) {
      send(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setLoading(true);
    trackEvent("chat.message", { text });

    try {
      const res = await fetch("/api/v1/stores/demo-store/guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: text,
          products,
          stream: true,
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error(`AI request failed: ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistantText = "";
      let finalResponse: GuideResponse | undefined;

      setMessages((m) => [...m, { role: "assistant", text: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const chunk = JSON.parse(line) as {
              type: "text" | "done" | "error";
              content?: string;
              response?: GuideResponse;
              message?: string;
            };

            if (chunk.type === "text" && chunk.content) {
              assistantText += chunk.content;
              setMessages((m) => {
                const last = m[m.length - 1];
                if (last?.role !== "assistant") return m;
                return [...m.slice(0, -1), { ...last, text: assistantText }];
              });
            } else if (chunk.type === "done" && chunk.response) {
              finalResponse = chunk.response;
            } else if (chunk.type === "error") {
              throw new Error(chunk.message ?? "AI stream error");
            }
          } catch {
            // Ignore malformed NDJSON lines.
          }
        }
      }

      setMessages((m) => {
        const last = m[m.length - 1];
        if (last?.role !== "assistant") return m;
        return [
          ...m.slice(0, -1),
          {
            ...last,
            text: finalResponse?.answer ?? assistantText,
            response: finalResponse,
          },
        ];
      });

      if (finalResponse?.productId) {
        trackEvent("chat.product_found", { sku: finalResponse.productId });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setMessages((m) => [...m, { role: "assistant", text: message }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

  return (
    <div className="absolute bottom-20 right-4 z-20 flex h-[28rem] w-80 flex-col rounded-2xl border border-white/10 bg-slate-900/95 shadow-2xl backdrop-blur">
      <div className="flex items-center justify-between border-b border-white/10 p-4">
        <div>
          <h2 className="font-semibold text-white">AI Guide</h2>
          <p className="text-[10px] uppercase tracking-wider text-brand-300">
            {provider}
          </p>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white">
          ✕
        </button>
      </div>
      <div className="flex-1 space-y-3 overflow-auto p-4 no-scrollbar">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
              m.role === "user"
                ? "ml-auto bg-brand-600 text-white"
                : "bg-slate-800 text-slate-100"
            }`}
          >
            {m.text}
            {m.role === "assistant" && m.response?.productId && (
              <span className="mt-1 block text-[10px] text-brand-300">
                SKU: {m.response.productId}
              </span>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSubmit} className="border-t border-white/10 p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask where to find something…"
          disabled={loading}
          className="w-full rounded-lg bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none ring-1 ring-slate-700 focus:ring-brand-500 disabled:opacity-50"
        />
      </form>
    </div>
  );
}
