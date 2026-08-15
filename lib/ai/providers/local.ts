import { GuideRequest, GuideResponse, AiProvider, GuideStreamChunk } from "./types";

const STOPWORDS = new Set([
  "where", "can", "find", "the", "an", "is", "are", "do", "you", "have",
  "any", "for", "to", "in", "on", "at", "of", "me", "my", "we", "get",
  "buy", "please", "some", "what", "which", "how", "much", "does", "it",
  "this", "that", "and", "or", "there", "here", "looking", "look",
  "need", "want", "got", "if",
]);

export class LocalResolver implements AiProvider {
  readonly name = "local";

  async guide(request: GuideRequest): Promise<GuideResponse> {
    const stream = this.guideStream(request);
    let answer = "";
    let response: GuideResponse | undefined;

    for await (const chunk of stream) {
      if (chunk.type === "text") {
        answer += chunk.content;
      } else if (chunk.type === "done") {
        response = chunk.response;
      }
    }

    return response ?? { answer };
  }

  async *guideStream(request: GuideRequest): AsyncGenerator<GuideStreamChunk> {
    const { query, products } = request;
    const q = query.toLowerCase();

    // Tokenize the query and drop filler words so natural-language questions
    // ("where can I find coffee?") still match product names.
    const tokens = q
      .split(/[^a-z0-9]+/)
      .filter((t) => t.length > 1 && !STOPWORDS.has(t));

    let match: GuideRequest["products"][number] | undefined;
    let bestScore = 0;
    for (const p of products) {
      const hay = `${p.name} ${p.aisle ?? ""} ${p.shelf ?? ""}`.toLowerCase();
      const score = tokens.filter((t) => hay.includes(t)).length;
      if (score > bestScore) {
        bestScore = score;
        match = p;
      }
    }

    if (!match) {
      const answer =
        "I couldn't find an exact match. Try searching for milk, bread, coffee, or eggs.";
      yield* this.yieldWords(answer);
      yield { type: "done", response: { answer } };
      return;
    }

    const from = request.from ?? { x: 0, y: 0, z: 0 };
    const to = match.coordinates
      ? { x: match.coordinates[0], y: match.coordinates[1], z: match.coordinates[2] }
      : { x: 0, y: 0, z: 0 };

    const answer = `${match.name} is in aisle ${match.aisle}, shelf ${match.shelf}. It is ${match.availability} at $${match.price.toFixed(2)} (${match.inventoryLevel} left).`;

    yield* this.yieldWords(answer);
    yield {
      type: "done",
      response: {
        answer,
        productId: match.sku,
        route: [from, to],
      },
    };
  }

  private async *yieldWords(text: string): AsyncGenerator<GuideStreamChunk> {
    const words = text.split(" ");
    for (let i = 0; i < words.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 20));
      yield { type: "text", content: (i === 0 ? "" : " ") + words[i] };
    }
  }
}
