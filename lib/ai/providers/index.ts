import { AiProvider } from "./types";
import { LocalResolver } from "./local";
import { OpenAiProvider } from "./openai";
import { AnthropicProvider } from "./anthropic";
import { GoogleProvider } from "./google";

export * from "./types";

export function createAiProvider(): AiProvider {
  const openaiKey = process.env.OPENAI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const googleKey = process.env.GOOGLE_API_KEY;
  const preferred = process.env.AI_PROVIDER?.toLowerCase();

  if (preferred === "openai" && openaiKey) {
    return new OpenAiProvider(openaiKey, process.env.OPENAI_MODEL);
  }

  if (preferred === "anthropic" && anthropicKey) {
    return new AnthropicProvider();
  }

  if (preferred === "google" && googleKey) {
    return new GoogleProvider();
  }

  if (openaiKey) {
    return new OpenAiProvider(openaiKey, process.env.OPENAI_MODEL);
  }

  if (anthropicKey) {
    return new AnthropicProvider();
  }

  if (googleKey) {
    return new GoogleProvider();
  }

  return new LocalResolver();
}
