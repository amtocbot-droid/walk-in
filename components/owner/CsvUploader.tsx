"use client";

import { useState } from "react";
import { CSV_TEMPLATE, parseCsvProducts, saveCsvSource } from "@/lib/inventory-sources";

interface CsvUploaderProps {
  userId: string;
  storeId: string;
  onUpload: () => void;
}

export default function CsvUploader({ userId, storeId, onUpload }: CsvUploaderProps) {
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setText(reader.result as string);
    reader.readAsText(file);
  };

  const apply = () => {
    try {
      const products = parseCsvProducts(text);
      saveCsvSource(userId, storeId, fileName || "CSV Upload", products);
      setStatus("success");
      setMessage(`Imported ${products.length} products.`);
      setText("");
      setFileName("");
      onUpload();
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Failed to parse CSV.");
    }
  };

  const loadTemplate = () => {
    setText(CSV_TEMPLATE);
    setFileName("template.csv");
  };

  return (
    <div className="space-y-3 rounded-xl border border-white/10 bg-slate-800/50 p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white">Bulk Import CSV</h3>
        <button
          type="button"
          onClick={loadTemplate}
          className="text-xs text-brand-400 hover:text-brand-300"
        >
          Load template
        </button>
      </div>

      <input
        type="file"
        accept=".csv,text/csv"
        onChange={handleFile}
        className="block w-full text-sm text-slate-300 file:mr-3 file:rounded file:border-0 file:bg-slate-700 file:px-3 file:py-1.5 file:text-white"
      />

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="sku,name,price,currency,inventoryLevel,availability,aisle,shelf"
        rows={5}
        className="w-full rounded-lg bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 outline-none ring-1 ring-slate-700 focus:ring-brand-500"
      />

      <button
        onClick={apply}
        disabled={!text.trim()}
        className="w-full rounded-lg bg-brand-600 py-2 text-sm font-medium text-white hover:bg-brand-500 disabled:opacity-50"
      >
        Import Products
      </button>

      {status !== "idle" && (
        <p
          className={`text-xs ${
            status === "success" ? "text-green-400" : "text-red-400"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
