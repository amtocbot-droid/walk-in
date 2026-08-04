import { PhotoSet, ProcessingJob, ProcessingStatus } from "./types";

function photoSetKey(userId: string, storeId: string): string {
  return `walk-in-photosets-${userId}-${storeId}`;
}

function jobsKey(userId: string, storeId: string): string {
  return `walk-in-jobs-${userId}-${storeId}`;
}

export function loadPhotoSets(userId: string, storeId: string): PhotoSet[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(photoSetKey(userId, storeId));
  if (!raw) return [];
  try {
    return JSON.parse(raw) as PhotoSet[];
  } catch {
    return [];
  }
}

export function savePhotoSet(photoSet: PhotoSet): void {
  if (typeof window === "undefined") return;
  const sets = loadPhotoSets(photoSet.userId, photoSet.storeId).filter(
    (p) => p.id !== photoSet.id
  );
  sets.push(photoSet);
  localStorage.setItem(photoSetKey(photoSet.userId, photoSet.storeId), JSON.stringify(sets));
}

export function deletePhotoSet(userId: string, storeId: string, photoSetId: string): void {
  if (typeof window === "undefined") return;
  const sets = loadPhotoSets(userId, storeId).filter((p) => p.id !== photoSetId);
  localStorage.setItem(photoSetKey(userId, storeId), JSON.stringify(sets));
}

export function loadJobs(userId: string, storeId: string): ProcessingJob[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(jobsKey(userId, storeId));
  if (!raw) return [];
  try {
    return JSON.parse(raw) as ProcessingJob[];
  } catch {
    return [];
  }
}

export function saveJob(job: ProcessingJob): void {
  if (typeof window === "undefined") return;
  const jobs = loadJobs(job.userId, job.storeId).filter((j) => j.id !== job.id);
  jobs.push(job);
  localStorage.setItem(jobsKey(job.userId, job.storeId), JSON.stringify(jobs));
}

export function updateJobStatus(
  userId: string,
  storeId: string,
  jobId: string,
  status: ProcessingStatus,
  updates?: Partial<ProcessingJob>
): void {
  const jobs = loadJobs(userId, storeId);
  const job = jobs.find((j) => j.id === jobId);
  if (!job) return;
  Object.assign(job, { status, ...updates });
  if (status === "completed" || status === "failed") {
    job.completedAt = new Date().toISOString();
  }
  localStorage.setItem(jobsKey(userId, storeId), JSON.stringify(jobs));
}
