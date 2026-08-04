"use client";

import { useRef, useState } from "react";

interface PanoramaUploaderProps {
  url: string;
  onChange: (url: string) => void;
}

export default function PanoramaUploader({ url, onChange }: PanoramaUploaderProps) {
  const [input, setInput] = useState(url);
  const fileRef = useRef<HTMLInputElement>(null);

  const applyUrl = () => {
    onChange(input.trim());
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setInput(dataUrl);
      onChange(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-slate-300">360° Panorama URL</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="https://... or use file upload"
          className="flex-1 rounded-lg bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none ring-1 ring-slate-700 focus:ring-brand-500"
        />
        <button
          onClick={applyUrl}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium hover:bg-brand-500"
        >
          Load
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium hover:bg-slate-600"
        >
          Upload
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="hidden"
        />
      </div>
      <p className="text-xs text-slate-500">
        Use an equirectangular (2:1) JPG/PNG. For testing: Poly Haven’s{" "}
        <a
          href="https://polyhaven.com/a/decor_shop"
          target="_blank"
          rel="noreferrer"
          className="text-brand-400 underline"
        >
          Decor Shop
        </a>
        .
      </p>
    </div>
  );
}
