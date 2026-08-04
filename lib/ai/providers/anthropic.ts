import { GuideRequest, GuideResponse, AiProvider, GuideStreamChunk } from "./types";

export class AnthropicProvider implements AiProvider {
  readonly name = "anthropic";

  async guide(request: GuideRequest): Promise<GuideResponse> {
    void request;
    return {
      answer:
        "Anthropic provider is configured but not yet implemented. Set OPENAI_API_KEY or use the local resolver for now.",
    };
  }

  async *guideStream(request: GuideRequest): AsyncGenerator<GuideStreamChunk> {
    const response = await this.guide(request);
    yield { type: "text", content: response.answer };
    yield { type: "done", response };
  }
}
