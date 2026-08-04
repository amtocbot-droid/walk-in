import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withStoreApiSecurity } from "@/lib/security";
import { createCloudBackendFromEnv } from "@/lib/photogrammetry/server";
import { PhotoSet, ProcessingJob } from "@/lib/photogrammetry/types";
import { enqueuePhotogrammetryJob } from "@/lib/queue";

const paramsSchema = z.object({ id: z.string() });

const photoSchema = z.object({
  id: z.string(),
  name: z.string(),
  dataUrl: z.string(),
  width: z.number(),
  height: z.number(),
});

const bodySchema = z.object({
  job: z.object({
    id: z.string(),
    storeId: z.string(),
    userId: z.string(),
    photoSetId: z.string(),
    status: z.enum(["queued", "running", "completed", "failed"]),
  }),
  photoSet: z.object({
    id: z.string(),
    storeId: z.string(),
    userId: z.string(),
    images: z.array(photoSchema),
    createdAt: z.string(),
  }),
});

export const POST = withStoreApiSecurity(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = paramsSchema.parse(await params);
  const body = bodySchema.parse(await request.json());

  if (id !== body.job.storeId || id !== body.photoSet.storeId) {
    return NextResponse.json({ error: "Store id mismatch" }, { status: 400 });
  }

  // Try to enqueue to the background worker first.
  const queued = await enqueuePhotogrammetryJob({
    jobId: body.job.id,
    storeId: body.job.storeId,
    userId: body.job.userId,
    photoSetId: body.photoSet.id,
    images: body.photoSet.images,
  });

  if (queued) {
    return NextResponse.json({
      job: { ...body.job, status: "queued" },
      queued: true,
    });
  }

  // Fallback: process synchronously if no queue/Redis is configured.
  const backend = createCloudBackendFromEnv();
  if (!backend) {
    return NextResponse.json(
      { error: "Cloud photogrammetry backend is not configured" },
      { status: 503 }
    );
  }

  try {
    const result = await backend.process(body.photoSet as PhotoSet);

    const completedJob: ProcessingJob = {
      ...body.job,
      status: "completed",
      outputUrl: result.glbUrl,
      processor: "cloud",
      completedAt: new Date().toISOString(),
    };

    return NextResponse.json({ job: completedJob, metadata: result.metadata });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Cloud processing failed";
    const failedJob: ProcessingJob = {
      ...body.job,
      status: "failed",
      error: message,
      processor: "cloud",
      completedAt: new Date().toISOString(),
    };

    return NextResponse.json({ job: failedJob, error: message }, { status: 500 });
  }
});
