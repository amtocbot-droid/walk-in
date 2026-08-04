import OpenAI from "openai";
import { GuideRequest, GuideResponse, AiProvider, GuideStreamChunk } from "./types";

const tools: OpenAI.Chat.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "find_product",
      description:
        "Find in-stock products that match the shopper's query by name, aisle, shelf, or category. Returns the best matches.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The product name, category, aisle, or shelf to search for.",
          },
        },
        required: ["query"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "check_stock",
      description:
        "Check current price and stock level for a specific product by SKU.",
      parameters: {
        type: "object",
        properties: {
          sku: {
            type: "string",
            description: "The product SKU.",
          },
        },
        required: ["sku"],
        additionalProperties: false,
      },
    },
  },
];

export class OpenAiProvider implements AiProvider {
  readonly name = "openai";
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model = "gpt-4o-mini") {
    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  private systemPrompt(language: string): string {
    return `You are a helpful in-store shopping assistant inside a 3D walk-in app.
You have access to a product catalog and two tools: find_product and check_stock.
Use the tools whenever the shopper asks about product location, price, availability, or stock.
Always base your answer on the tool results; do not guess.
When a product is found, include its SKU, aisle, shelf, price, and stock level.
If the shopper shares their current position, guide them with a short route description.
Respond in language code: ${language}.`;
  }

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
    const { query, products, from, language = "en" } = request;

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: this.systemPrompt(language) },
      {
        role: "user",
        content: JSON.stringify({
          query,
          from,
          products: products.map((p) => ({
            sku: p.sku,
            name: p.name,
            price: p.price,
            currency: p.currency,
            availability: p.availability,
            inventoryLevel: p.inventoryLevel,
            aisle: p.aisle,
            shelf: p.shelf,
            coordinates: p.coordinates,
          })),
        }),
      },
    ];

    const first = await this.client.chat.completions.create({
      model: this.model,
      messages,
      tools,
      tool_choice: "auto",
      temperature: 0.2,
    });

    const choice = first.choices[0];
    const message = choice?.message;

    if (message?.tool_calls && message.tool_calls.length > 0) {
      messages.push(message);

      for (const toolCall of message.tool_calls) {
        const fn = toolCall.function;
        let result: unknown;
        try {
          const args = JSON.parse(fn.arguments) as Record<string, unknown>;
          if (fn.name === "find_product") {
            result = this.handleFindProduct(args, products);
          } else if (fn.name === "check_stock") {
            result = this.handleCheckStock(args, products);
          } else {
            result = { error: "Unknown tool" };
          }
        } catch {
          result = { error: "Invalid tool arguments" };
        }

        messages.push({
          tool_call_id: toolCall.id,
          role: "tool",
          content: JSON.stringify(result),
        });
      }

      const final = await this.client.chat.completions.create({
        model: this.model,
        messages,
        tools,
        temperature: 0.2,
        stream: true,
      });

      yield* this.streamAnswer(final, products, from);
      return;
    }

    // No tool call; stream the direct response if the model supports it, else yield the content.
    if (message?.content) {
      yield { type: "text", content: message.content };
      yield {
        type: "done",
        response: { answer: message.content },
      };
      return;
    }

    yield {
      type: "done",
      response: {
        answer:
          "I'm not sure about that. Try asking for a specific product, aisle, or shelf.",
      },
    };
  }

  private async *streamAnswer(
    stream: AsyncIterable<OpenAI.Chat.ChatCompletionChunk>,
    products: GuideRequest["products"],
    from?: GuideRequest["from"]
  ): AsyncGenerator<GuideStreamChunk> {
    let answer = "";

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) {
        answer += delta;
        yield { type: "text", content: delta };
      }
    }

    const response = this.deriveResponse(answer, products, from);
    yield { type: "done", response };
  }

  private deriveResponse(
    answer: string,
    products: GuideRequest["products"],
    from?: GuideRequest["from"]
  ): GuideResponse {
    const mentioned = products.find((p) => answer.toLowerCase().includes(p.sku.toLowerCase()));

    if (!mentioned) {
      return { answer };
    }

    const start = from ?? { x: 0, y: 0, z: 0 };
    const end = mentioned.coordinates
      ? { x: mentioned.coordinates[0], y: mentioned.coordinates[1], z: mentioned.coordinates[2] }
      : { x: 0, y: 0, z: 0 };

    return {
      answer,
      productId: mentioned.sku,
      route: [start, end],
    };
  }

  private handleFindProduct(
    args: Record<string, unknown>,
    products: GuideRequest["products"]
  ): unknown {
    const q = String(args.query ?? "").toLowerCase();
    const matches = products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.aisle?.toLowerCase().includes(q) ||
          p.shelf?.toLowerCase().includes(q)
      )
      .slice(0, 5);

    return {
      matches: matches.map((p) => ({
        sku: p.sku,
        name: p.name,
        price: p.price,
        currency: p.currency,
        availability: p.availability,
        inventoryLevel: p.inventoryLevel,
        aisle: p.aisle,
        shelf: p.shelf,
        coordinates: p.coordinates,
      })),
    };
  }

  private handleCheckStock(
    args: Record<string, unknown>,
    products: GuideRequest["products"]
  ): unknown {
    const sku = String(args.sku ?? "");
    const product = products.find((p) => p.sku.toLowerCase() === sku.toLowerCase());

    if (!product) {
      return { error: `No product found with SKU ${sku}.` };
    }

    return {
      sku: product.sku,
      name: product.name,
      price: product.price,
      currency: product.currency,
      availability: product.availability,
      inventoryLevel: product.inventoryLevel,
      aisle: product.aisle,
      shelf: product.shelf,
      coordinates: product.coordinates,
    };
  }
}
