export interface PhotoSet {
  id: string;
  storeId: string;
  userId: string;
  images: Photo[];
  createdAt: string;
}

export interface Photo {
  id: string;
  name: string;
  dataUrl: string;
  width: number;
  height: number;
}

export type ProcessingStatus = "queued" | "running" | "completed" | "failed";

export interface ProcessingJob {
  id: string;
  storeId: string;
  userId: string;
  photoSetId: string;
  status: ProcessingStatus;
  outputUrl?: string;
  error?: string;
  processor?: "placeholder" | "cloud";
  startedAt?: string;
  completedAt?: string;
}

export type ProcessorName = "placeholder" | "cloud";

export interface Processor {
  readonly name: ProcessorName;
  process(photoSet: PhotoSet, onProgress?: (message: string) => void): Promise<Blob>;
}

export interface CloudBackendResult {
  glbUrl: string;
  metadata?: Record<string, unknown>;
}

export interface CloudBackend {
  readonly name: string;
  process(photoSet: PhotoSet): Promise<CloudBackendResult>;
}
