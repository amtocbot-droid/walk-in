import { PhotoSet, ProcessingJob, Processor } from "./types";
import { PlaceholderProcessor } from "./processors/placeholder";
import { saveJob, updateJobStatus } from "./storage";

export * from "./types";
export * from "./storage";
export { PlaceholderProcessor } from "./processors/placeholder";

export function getProcessor(name: string): Processor {
  if (name === "placeholder") return new PlaceholderProcessor();
  // Future: "colmap", "meshroom", "cloud-api"
  throw new Error(`Unknown photogrammetry processor: ${name}`);
}

export async function runProcessingJob(
  job: ProcessingJob,
  photoSet: PhotoSet,
  processorName = "placeholder"
): Promise<void> {
  saveJob({ ...job, status: "running", startedAt: new Date().toISOString() });

  try {
    const processor = getProcessor(processorName);
    const blob = await processor.process(photoSet, (message) => {
      // Future: broadcast progress via SSE/WebSocket.
      console.log(`[photogrammetry ${job.id}]`, message);
    });

    const dataUrl = await blobToDataUrl(blob);

    updateJobStatus(job.userId, job.storeId, job.id, "completed", {
      outputUrl: dataUrl,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Processing failed";
    updateJobStatus(job.userId, job.storeId, job.id, "failed", { error: message });
  }
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
