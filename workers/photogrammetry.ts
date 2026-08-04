import { createPhotogrammetryWorker, PhotogrammetryJobData } from "@/lib/queue";
import { createCloudBackendFromEnv } from "@/lib/photogrammetry/server";
import { PhotoSet } from "@/lib/photogrammetry/types";
import type { Job } from "bullmq";

async function processJob(job: Job<PhotogrammetryJobData>): Promise<void> {
  const backend = createCloudBackendFromEnv();
  if (!backend) {
    throw new Error("Cloud photogrammetry backend is not configured");
  }

  const photoSet: PhotoSet = {
    id: job.data.photoSetId,
    storeId: job.data.storeId,
    userId: job.data.userId,
    images: job.data.images,
    createdAt: new Date().toISOString(),
  };

  const result = await backend.process(photoSet);
  console.log(`[worker] job ${job.data.jobId} completed: ${result.glbUrl}`);
}

async function main() {
  const worker = await createPhotogrammetryWorker(processJob);

  if (!worker) {
    console.error("Redis is not configured; photogrammetry worker cannot start.");
    process.exit(1);
  }

  worker.on("completed", (job) => {
    console.log(`[worker] completed job ${job.id}`);
  });

  worker.on("failed", (job, err) => {
    console.error(`[worker] failed job ${job?.id}:`, err);
  });

  console.log("Photogrammetry worker started");
}

void main();
