import { CloudBackend, CloudBackendResult, PhotoSet } from "../types";

export interface CloudBackendConfig {
  /** Human-readable backend name (e.g., "polycam", "kiri", "custom"). */
  name: string;
  /** Endpoint to POST photos to. */
  uploadUrl: string;
  /** Optional template for polling status; {jobId} is substituted. */
  statusUrlTemplate?: string;
  /** Optional template for downloading the result; {jobId} is substituted. */
  downloadUrlTemplate?: string;
  /** API key header value. */
  apiKey: string;
  /** Header name for the API key (default: Authorization). */
  apiKeyHeader?: string;
  /** How often to poll the status endpoint (ms). */
  pollIntervalMs: number;
  /** Maximum number of status polls before giving up. */
  maxPolls: number;
}

/**
 * Generic cloud photogrammetry backend.
 *
 * Flow:
 * 1. POST images as multipart/form-data to `uploadUrl`.
 * 2. Expect `{ jobId: string }` (or `id`) in the JSON response.
 * 3. Poll `statusUrlTemplate` until the job reports `done`/`completed`/`succeeded`.
 * 4. GET `downloadUrlTemplate` and return the GLB URL/binary.
 *
 * This abstraction works with Polycam, KIRI Engine, and similar webhook-style
 * photogrammetry APIs once the endpoint templates are configured.
 */
export class GenericCloudBackend implements CloudBackend {
  readonly name: string;
  private config: CloudBackendConfig;

  constructor(config: CloudBackendConfig) {
    this.name = config.name;
    this.config = config;
  }

  async process(photoSet: PhotoSet): Promise<CloudBackendResult> {
    const jobId = await this.uploadPhotos(photoSet);

    if (this.config.statusUrlTemplate) {
      await this.pollUntilComplete(jobId);
    }

    if (!this.config.downloadUrlTemplate) {
      return { glbUrl: "", metadata: { jobId, note: "No download URL template configured" } };
    }

    const downloadUrl = this.substitute(this.config.downloadUrlTemplate, { jobId });
    const glbBlob = await this.download(downloadUrl);

    const buffer = Buffer.from(await glbBlob.arrayBuffer());

    // Store in S3 if configured, else fall back to a data URL.
    try {
      const { uploadAsset } = await import("@/lib/s3");
      const key = `stores/${photoSet.storeId}/meshes/${photoSet.id}.glb`;
      const s3Url = await uploadAsset(key, buffer, "model/gltf-binary");
      return { glbUrl: s3Url, metadata: { jobId, downloadUrl, s3Key: key } };
    } catch {
      const glbDataUrl = `data:model/gltf-binary;base64,${buffer.toString("base64")}`;
      return { glbUrl: glbDataUrl, metadata: { jobId, downloadUrl } };
    }
  }

  private async uploadPhotos(photoSet: PhotoSet): Promise<string> {
    const form = new FormData();

    for (const photo of photoSet.images) {
      const blob = dataUrlToBlob(photo.dataUrl);
      form.append("images", blob, photo.name);
    }

    form.append("metadata", JSON.stringify({ storeId: photoSet.storeId, photoSetId: photoSet.id }));

    const headers: Record<string, string> = {};
    const apiKeyHeader = this.config.apiKeyHeader || "Authorization";
    headers[apiKeyHeader] =
      apiKeyHeader.toLowerCase() === "authorization"
        ? `Bearer ${this.config.apiKey}`
        : this.config.apiKey;

    const res = await fetch(this.config.uploadUrl, {
      method: "POST",
      headers,
      body: form as unknown as BodyInit,
    });

    if (!res.ok) {
      throw new Error(`Upload failed: ${res.status} ${await res.text()}`);
    }

    const data = (await res.json()) as { jobId?: string; id?: string };
    const jobId = data.jobId ?? data.id;
    if (!jobId) {
      throw new Error("Cloud backend did not return a job id");
    }
    return jobId;
  }

  private async pollUntilComplete(jobId: string): Promise<void> {
    const url = this.substitute(this.config.statusUrlTemplate!, { jobId });
    const headers = this.authHeaders();

    for (let i = 0; i < this.config.maxPolls; i++) {
      await sleep(this.config.pollIntervalMs);

      const res = await fetch(url, { headers });
      if (!res.ok) {
        throw new Error(`Status poll failed: ${res.status}`);
      }

      const data = (await res.json()) as { status?: string; state?: string; error?: string };
      const status = (data.status ?? data.state ?? "").toLowerCase();

      if (["done", "completed", "succeeded", "success"].includes(status)) {
        return;
      }
      if (["failed", "error", "cancelled"].includes(status)) {
        throw new Error(`Cloud processing failed: ${data.error ?? status}`);
      }
    }

    throw new Error("Cloud processing timed out");
  }

  private async download(url: string): Promise<Blob> {
    const res = await fetch(url, { headers: this.authHeaders() });
    if (!res.ok) {
      throw new Error(`Download failed: ${res.status}`);
    }
    return res.blob();
  }

  private authHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    const apiKeyHeader = this.config.apiKeyHeader || "Authorization";
    headers[apiKeyHeader] =
      apiKeyHeader.toLowerCase() === "authorization"
        ? `Bearer ${this.config.apiKey}`
        : this.config.apiKey;
    return headers;
  }

  private substitute(template: string, vars: { jobId: string }): string {
    return template.replace(/\{jobId\}/g, vars.jobId);
  }
}

function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(",");
  const mime = parts[0]?.match(/:(.*?);/)?.[1] ?? "application/octet-stream";
  const byteString = atob(parts[1] ?? "");
  const array = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) {
    array[i] = byteString.charCodeAt(i);
  }
  return new Blob([array], { type: mime });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
