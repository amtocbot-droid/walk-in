import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { guideShopper, guideShopperStream } from "@/lib/ai";
import { getProducts } from "@/lib/db";
import { fetchProducts } from "@/lib/inventory";
import { withPublicApiSecurity } from "@/lib/security";

const paramsSchema = z.object({ id: z.string() });

const bodySchema = z.object({
  query: z.string().min(1),
  language: z.string().optional(),
  from: z.object({ x: z.number(), y: z.number(), z: z.number() }).optional(),
  stream: z.boolean().optional().default(false),
});

export const POST = withPublicApiSecurity(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = paramsSchema.parse(await params);
  const body = bodySchema.parse(await request.json());

  // Prefer the store's real inventory; fall back to the demo catalog.
  const stored = await getProducts(id).catch(() => []);
  const products = stored.length > 0 ? stored : await fetchProducts(id);

  if (!body.stream) {
    const result = await guideShopper({
      query: body.query,
      language: body.language,
      products,
      from: body.from,
    });
    return NextResponse.json(result);
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of guideShopperStream({
          query: body.query,
          language: body.language,
          products,
          from: body.from,
        })) {
          controller.enqueue(encoder.encode(JSON.stringify(chunk) + "\n"));
        }
        controller.close();
      } catch (err) {
        const message = err instanceof Error ? err.message : "AI stream failed";
        controller.enqueue(
          encoder.encode(JSON.stringify({ type: "error", message }) + "\n")
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
});
