import { GenericCloudBackend, CloudBackendConfig } from "./cloud";
import { CloudBackend } from "../types";

export * from "./cloud";

export function createCloudBackendFromEnv(): CloudBackend | null {
  const backendName = process.env.PHOTOGRAMMETRY_BACKEND;
  if (backendName !== "cloud") return null;

  const uploadUrl = process.env.PHOTOGRAMMETRY_UPLOAD_URL;
  const apiKey = process.env.PHOTOGRAMMETRY_API_KEY;

  if (!uploadUrl || !apiKey) {
    throw new Error(
      "Cloud photogrammetry is enabled but PHOTOGRAMMETRY_UPLOAD_URL or PHOTOGRAMMETRY_API_KEY is missing"
    );
  }

  const config: CloudBackendConfig = {
    name: process.env.PHOTOGRAMMETRY_CLOUD_NAME || "cloud",
    uploadUrl,
    apiKey,
    statusUrlTemplate: process.env.PHOTOGRAMMETRY_STATUS_URL_TEMPLATE,
    downloadUrlTemplate: process.env.PHOTOGRAMMETRY_DOWNLOAD_URL_TEMPLATE,
    apiKeyHeader: process.env.PHOTOGRAMMETRY_API_KEY_HEADER,
    pollIntervalMs: Number(process.env.PHOTOGRAMMETRY_POLL_INTERVAL_MS || "5000"),
    maxPolls: Number(process.env.PHOTOGRAMMETRY_MAX_POLLS || "60"),
  };

  return new GenericCloudBackend(config);
}
