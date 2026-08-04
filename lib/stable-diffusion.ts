export interface StableDiffusionRequest {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  steps?: number;
  cfgScale?: number;
  sampler?: string;
  seed?: number;
}

export interface StableDiffusionResult {
  images: string[]; // base64 data URLs
  info?: string;
}

export interface ComfyUIModel {
  name: string;
  type: string;
}

const SD_API_URL = process.env.SD_API_URL ?? "http://127.0.0.1:8188";

export function isStableDiffusionConfigured(): boolean {
  return !!process.env.SD_API_URL;
}

export async function checkStableDiffusionHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${SD_API_URL}/system_stats`, {
      method: "GET",
      signal: AbortSignal.timeout(3000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function getAvailableCheckpoints(): Promise<string[]> {
  try {
    const response = await fetch(`${SD_API_URL}/models/checkpoints`);
    if (!response.ok) return [];
    return await response.json();
  } catch {
    return [];
  }
}

export async function generateStableDiffusionImage(
  request: StableDiffusionRequest
): Promise<StableDiffusionResult> {
  const checkpoints = await getAvailableCheckpoints();
  if (checkpoints.length === 0) {
    throw new Error(
      "No Stable Diffusion checkpoint models found. Please download a model (e.g., v1-5-pruned-emaonly.safetensors) to ComfyUI/models/checkpoints/"
    );
  }

  const clientId = `walkin_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const ckptName = checkpoints[0];

  const workflow = {
    client_id: clientId,
    prompt: {
      "3": {
        class_type: "KSampler",
        inputs: {
          seed: request.seed ?? Math.floor(Math.random() * 1000000),
          steps: request.steps ?? 20,
          cfg: request.cfgScale ?? 7,
          sampler_name: request.sampler ?? "euler",
          scheduler: "normal",
          denoise: 1,
          model: ["4", 0],
          positive: ["6", 0],
          negative: ["7", 0],
          latent_image: ["5", 0],
        },
      },
      "4": {
        class_type: "CheckpointLoaderSimple",
        inputs: {
          ckpt_name: ckptName,
        },
      },
      "5": {
        class_type: "EmptyLatentImage",
        inputs: {
          width: request.width ?? 2048,
          height: request.height ?? 1024,
          batch_size: 1,
        },
      },
      "6": {
        class_type: "CLIPTextEncode",
        inputs: {
          text: request.prompt,
          clip: ["4", 1],
        },
      },
      "7": {
        class_type: "CLIPTextEncode",
        inputs: {
          text: request.negativePrompt ?? "",
          clip: ["4", 1],
        },
      },
      "8": {
        class_type: "VAEDecode",
        inputs: {
          samples: ["3", 0],
          vae: ["4", 2],
        },
      },
      "9": {
        class_type: "SaveImage",
        inputs: {
          filename_prefix: "walkin",
          images: ["8", 0],
        },
      },
    },
  };

  const queueResponse = await fetch(`${SD_API_URL}/prompt`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(workflow),
  });

  if (!queueResponse.ok) {
    const error = await queueResponse.text();
    throw new Error(`ComfyUI queue failed: ${queueResponse.status} ${error}`);
  }

  const queueData = await queueResponse.json();
  const promptId = queueData.prompt_id;

  // Poll for completion
  const maxAttempts = 60;
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const historyResponse = await fetch(`${SD_API_URL}/history/${promptId}`);
    if (!historyResponse.ok) continue;

    const history = await historyResponse.json();
    const promptHistory = history[promptId];

    if (!promptHistory) continue;

    if (promptHistory.status?.completed) {
      const images: string[] = [];

      for (const nodeId of Object.keys(promptHistory.outputs ?? {})) {
        const nodeOutput = promptHistory.outputs[nodeId];
        if (nodeOutput.images) {
          for (const image of nodeOutput.images) {
            const imageResponse = await fetch(
              `${SD_API_URL}/view?filename=${encodeURIComponent(image.filename)}&subfolder=${encodeURIComponent(image.subfolder ?? "")}&type=${image.type}`
            );
            if (imageResponse.ok) {
              const blob = await imageResponse.blob();
              const base64 = await blobToBase64(blob);
              images.push(base64);
            }
          }
        }
      }

      return { images };
    }

    if (promptHistory.status?.status_str === "error") {
      const errorMsg = promptHistory.status?.messages?.[0]?.[1] ?? "ComfyUI generation failed";
      throw new Error(String(errorMsg));
    }
  }

  throw new Error("ComfyUI generation timed out");
}

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
