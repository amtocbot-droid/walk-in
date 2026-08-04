"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/telemetry";

interface StreetViewUploaderProps {
  onUploaded: (imageUrl: string) => void;
}

export default function StreetViewUploader({ onUploaded }: StreetViewUploaderProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setStatus("error");
      setMessage("Please upload an image file (JPG, PNG, WebP).");
      return;
    }

    setLoading(true);
    setStatus("uploading");
    setMessage("Processing 360° photo…");
    trackEvent("streetview.upload", { filename: file.name, size: file.size });

    try {
      // Convert to data URL for local preview and storage.
      const dataUrl = await fileToDataUrl(file);

      // In production, upload to S3 and return the URL.
      // For now, use the data URL directly.
      onUploaded(dataUrl);
      setStatus("done");
      setMessage("360° photo applied to your scene.");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3 rounded-xl border border-white/10 bg-slate-800/50 p-4">
      <h3 className="font-semibold text-white">Capture with Google Street View</h3>
      <p className="text-xs text-slate-400">
        Use the free Google Street View app (iOS/Android) to capture a 360° photo of your
        establishment, then upload it here.
      </p>

      <div className="rounded-lg bg-slate-700/50 p-3 text-xs text-slate-300">
        <p className="font-medium">How to capture:</p>
        <ol className="mt-1 list-inside list-decimal space-y-1">
          <li>Open Google Street View on your phone</li>
          <li>Tap the camera icon to capture a 360° photo</li>
          <li>Stand in the center of your space and rotate slowly</li>
          <li>Export the photo and upload it here</li>
        </ol>
      </div>

      <input
        type="file"
        accept="image/*"
        onChange={handleFile}
        disabled={loading}
        className="block w-full text-sm text-slate-300 file:mr-3 file:rounded file:border-0 file:bg-slate-700 file:px-3 file:py-1.5 file:text-white"
      />

      {status !== "idle" && (
        <p
          className={`text-xs ${
            status === "error"
              ? "text-red-400"
              : status === "done"
              ? "text-green-400"
              : "text-slate-400"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
