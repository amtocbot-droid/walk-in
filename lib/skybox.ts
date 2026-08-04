export interface SkyboxGenerationRequest {
  prompt: string;
  negativePrompt?: string;
  style?: string;
  width?: number;
  height?: number;
}

export interface SkyboxGenerationResult {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  imageUrl?: string;
  thumbnailUrl?: string;
  error?: string;
}

export interface SkyboxStyle {
  id: string;
  name: string;
  description?: string;
}

const SKYBOX_API_BASE = process.env.SKYBOX_API_URL ?? "https://api.blockadelabs.com/v1";
const SKYBOX_API_KEY = process.env.SKYBOX_API_KEY;

export function isSkyboxConfigured(): boolean {
  return !!SKYBOX_API_KEY;
}

export async function generateSkyboxImage(
  request: SkyboxGenerationRequest
): Promise<SkyboxGenerationResult> {
  if (!SKYBOX_API_KEY) {
    throw new Error("Skybox AI is not configured. Set SKYBOX_API_KEY.");
  }

  const response = await fetch(`${SKYBOX_API_BASE}/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SKYBOX_API_KEY}`,
    },
    body: JSON.stringify({
      prompt: request.prompt,
      negative_prompt: request.negativePrompt,
      style: request.style ?? "realistic",
      width: request.width ?? 2048,
      height: request.height ?? 1024,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Skybox generation failed: ${response.status} ${error}`);
  }

  const data = await response.json();
  return {
    id: data.id ?? data.job_id,
    status: "pending",
  };
}

export async function getSkyboxGenerationStatus(
  generationId: string
): Promise<SkyboxGenerationResult> {
  if (!SKYBOX_API_KEY) {
    throw new Error("Skybox AI is not configured. Set SKYBOX_API_KEY.");
  }

  const response = await fetch(`${SKYBOX_API_BASE}/generate/${generationId}`, {
    headers: {
      Authorization: `Bearer ${SKYBOX_API_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Skybox status check failed: ${response.status}`);
  }

  const data = await response.json();
  return {
    id: generationId,
    status: data.status ?? "processing",
    imageUrl: data.image_url ?? data.file_url,
    thumbnailUrl: data.thumbnail_url ?? data.thumb_url,
    error: data.error,
  };
}

export async function listSkyboxStyles(): Promise<SkyboxStyle[]> {
  if (!SKYBOX_API_KEY) {
    return [];
  }

  try {
    const response = await fetch(`${SKYBOX_API_BASE}/styles`, {
      headers: {
        Authorization: `Bearer ${SKYBOX_API_KEY}`,
      },
    });

    if (!response.ok) return [];
    const data = await response.json();
    return data.styles ?? [];
  } catch {
    return [];
  }
}

export async function waitForSkyboxGeneration(
  generationId: string,
  maxAttempts = 60,
  intervalMs = 5000
): Promise<SkyboxGenerationResult> {
  for (let i = 0; i < maxAttempts; i++) {
    const result = await getSkyboxGenerationStatus(generationId);

    if (result.status === "completed") {
      return result;
    }

    if (result.status === "failed") {
      throw new Error(result.error ?? "Skybox generation failed");
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error("Skybox generation timed out");
}
