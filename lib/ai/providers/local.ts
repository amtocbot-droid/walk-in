import { GuideRequest, GuideResponse, AiProvider, GuideStreamChunk } from "./types";

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

    const match = products.find(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.aisle?.toLowerCase().includes(q) ||
        p.shelf?.toLowerCase().includes(q)
    );

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
