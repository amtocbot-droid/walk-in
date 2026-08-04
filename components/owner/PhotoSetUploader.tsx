"use client";

import { useState } from "react";
import {
  PhotoSet,
  Photo,
  ProcessingJob,
  ProcessorName,
  savePhotoSet,
  saveJob,
  runProcessingJob,
  loadJobs,
  updateJobStatus,
} from "@/lib/photogrammetry";

interface PhotoSetUploaderProps {
  userId: string;
  storeId: string;
  plan?: "free" | "pro" | "enterprise";
  onJobStarted: () => void;
  onComplete?: (outputUrl: string) => void;
}

export default function PhotoSetUploader({
  userId,
  storeId,
  plan = "free",
  onJobStarted,
  onComplete,
}: PhotoSetUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "running" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const [processor, setProcessor] = useState<ProcessorName>("placeholder");

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []).filter((f) =>
      f.type.startsWith("image/")
    );
    setFiles((prev) => [...prev, ...selected]);
  };

  const removeFile = (name: string) => {
    setFiles((prev) => prev.filter((f) => f.name !== name));
  };

  const process = async () => {
    if (files.length === 0) return;
    setLoading(true);
    setStatus("running");
    setMessage("Reading photos…");

    const photos: Photo[] = await Promise.all(
      files.map(async (file) => {
        const dataUrl = await fileToDataUrl(file);
        return {
          id: `photo_${Math.random().toString(36).slice(2)}`,
          name: file.name,
          dataUrl,
          width: 0,
          height: 0,
        };
      })
    );

    const photoSet: PhotoSet = {
      id: `ps_${Date.now()}`,
      storeId,
      userId,
      images: photos,
      createdAt: new Date().toISOString(),
    };
    savePhotoSet(photoSet);

    const job: ProcessingJob = {
      id: `job_${Date.now()}`,
      storeId,
      userId,
      photoSetId: photoSet.id,
      status: "queued",
      processor,
    };
    saveJob(job);
    onJobStarted();

    setMessage(
      processor === "cloud"
        ? "Uploading to cloud photogrammetry backend…"
        : "Generating 3D mesh…"
    );

    try {
      if (processor === "cloud") {
        if (plan === "free") {
          throw new Error("Cloud photogrammetry requires a Pro or Enterprise plan.");
        }
        await runCloudProcessing(job, photoSet);
      } else {
        await runProcessingJob(job, photoSet, "placeholder");
      }

      const completedJob = loadJobs(userId, storeId).find((j) => j.id === job.id);
      if (completedJob?.outputUrl) {
        onComplete?.(completedJob.outputUrl);
      }
      setStatus("done");
      setMessage("Mesh generated. Refresh the page to view it.");
      setFiles([]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Processing failed";
      updateJobStatus(userId, storeId, job.id, "failed", { error: errorMessage });
      setStatus("error");
      setMessage(errorMessage);
    } finally {
      setLoading(false);
      onJobStarted();
    }
  };

  const runCloudProcessing = async (job: ProcessingJob, photoSet: PhotoSet) => {
    saveJob({ ...job, status: "running", startedAt: new Date().toISOString() });

    const res = await fetch(`/api/v1/stores/${storeId}/photogrammetry/process`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ job, photoSet }),
    });

    const data = (await res.json()) as { job?: ProcessingJob; error?: string };

    if (!res.ok || !data.job) {
      throw new Error(data.error ?? `Cloud processing failed: ${res.status}`);
    }

    saveJob(data.job);
  };

  return (
    <div className="space-y-3 rounded-xl border border-white/10 bg-slate-800/50 p-4">
      <h3 className="font-semibold text-white">Photogrammetry (Beta)</h3>
      <p className="text-xs text-slate-400">
        Upload a photo set of the space. The placeholder processor generates a quick
        GLB preview locally. Enable the cloud backend in <code>.env.local</code> to
        process with a real photogrammetry API (Polycam, KIRI Engine, etc.).
      </p>

      <div className="flex items-center gap-2">
        <label className="text-xs text-slate-300">Processor:</label>
        <select
          value={processor}
          onChange={(e) => setProcessor(e.target.value as ProcessorName)}
          className="rounded bg-slate-700 px-2 py-1 text-xs text-white outline-none"
        >
          <option value="placeholder">Local placeholder</option>
          <option value="cloud" disabled={plan === "free"}>
            Cloud backend {plan === "free" ? "(Pro+)" : ""}
          </option>
        </select>
      </div>
      {plan === "free" && (
        <p className="text-xs text-amber-400">
          Cloud photogrammetry is available on Pro and Enterprise plans.
        </p>
      )}

      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleFiles}
        className="block w-full text-sm text-slate-300 file:mr-3 file:rounded file:border-0 file:bg-slate-700 file:px-3 file:py-1.5 file:text-white"
      />

      {files.length > 0 && (
        <ul className="max-h-32 space-y-1 overflow-auto text-xs text-slate-300">
          {files.map((f) => (
            <li key={f.name} className="flex items-center justify-between">
              <span className="truncate">{f.name}</span>
              <button
                onClick={() => removeFile(f.name)}
                className="text-red-400 hover:text-red-300"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={process}
        disabled={files.length === 0 || loading}
        className="w-full rounded-lg bg-brand-600 py-2 text-sm font-medium text-white hover:bg-brand-500 disabled:opacity-50"
      >
        {loading ? "Processing…" : "Generate 3D Mesh"}
      </button>

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
