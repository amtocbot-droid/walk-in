const PHOTOGRAMMETRY_QUEUE = "photogrammetry";

export interface PhotogrammetryJobData {
  jobId: string;
  storeId: string;
  userId: string;
  photoSetId: string;
  images: Array<{ id: string; name: string; dataUrl: string; width: number; height: number }>;
}

function isNodeRuntime(): boolean {
  return typeof process !== "undefined" && !!process.versions?.node;
}

// Dynamic import that bundlers cannot statically resolve.
// This prevents BullMQ (and its native valkey-glide dependency) from being bundled for Cloudflare Workers.
const BULLMQ_SPECIFIER = "bull" + "mq";

async function getBullMq() {
  if (!isNodeRuntime()) return null;

  try {
    return await import(BULLMQ_SPECIFIER);
  } catch {
    return null;
  }
}

// BullMQ requires maxRetriesPerRequest: null, which the shared cache client
// in lib/redis.ts does not use — give BullMQ its own dedicated connection.
const IOREDIS_SPECIFIER = "io" + "redis";
let bullMqConnection: import("ioredis").Redis | null | undefined;

async function getBullMqConnection(): Promise<import("ioredis").Redis | null> {
  const url = process.env.REDIS_URL;
  if (!url || !isNodeRuntime()) return null;

  if (bullMqConnection === undefined) {
    try {
      const { default: IORedis } = await import(IOREDIS_SPECIFIER);
      bullMqConnection = new IORedis(url, {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
      });
    } catch {
      bullMqConnection = null;
    }
  }

  return bullMqConnection ?? null;
}

export async function getPhotogrammetryQueue(): Promise<import("bullmq").Queue | null> {
  const redis = await getBullMqConnection();
  if (!redis) return null;

  const bullmq = await getBullMq();
  if (!bullmq) return null;

  return new bullmq.Queue(PHOTOGRAMMETRY_QUEUE, { connection: redis });
}

export async function enqueuePhotogrammetryJob(data: PhotogrammetryJobData): Promise<import("bullmq").Job | null> {
  const queue = await getPhotogrammetryQueue();
  if (!queue) return null;
  return queue.add("process", data, {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: true,
    removeOnFail: false,
  });
}

export async function createPhotogrammetryWorker(
  processor: (job: import("bullmq").Job<PhotogrammetryJobData>) => Promise<void>
): Promise<import("bullmq").Worker | null> {
  const redis = await getBullMqConnection();
  if (!redis) return null;

  const bullmq = await getBullMq();
  if (!bullmq) return null;

  return new bullmq.Worker(PHOTOGRAMMETRY_QUEUE, processor, { connection: redis });
}
