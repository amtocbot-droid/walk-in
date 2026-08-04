import {
  GuideRequest,
  GuideResponse,
  GuideStreamChunk,
  createAiProvider,
} from "./ai/providers";

export type { GuideRequest, GuideResponse, GuideStreamChunk } from "./ai/providers";
export { createAiProvider } from "./ai/providers";

const provider = createAiProvider();

export async function guideShopper(request: GuideRequest): Promise<GuideResponse> {
  return provider.guide(request);
}

export async function* guideShopperStream(
  request: GuideRequest
): AsyncGenerator<GuideStreamChunk> {
  yield* provider.guideStream(request);
}

export function getAiProviderName(): string {
  return provider.name;
}
