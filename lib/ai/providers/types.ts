import { Product } from "@/lib/store";

export interface GuideRequest {
  query: string;
  language?: string;
  products: Product[];
  from?: { x: number; y: number; z: number };
}

export interface GuideResponse {
  answer: string;
  productId?: string;
  route?: Array<{ x: number; y: number; z: number }>;
}

export type GuideStreamChunk =
  | { type: "text"; content: string }
  | { type: "done"; response: GuideResponse };

export interface AiProvider {
  readonly name: string;
  guide(request: GuideRequest): Promise<GuideResponse>;
  guideStream(request: GuideRequest): AsyncIterable<GuideStreamChunk>;
}
