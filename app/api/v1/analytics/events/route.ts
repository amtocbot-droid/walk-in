import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withApiSecurity } from "@/lib/security";
import { createTelemetryProvider } from "@/lib/telemetry/providers";
import { appendTelemetryEvents } from "@/lib/db";

const eventSchema = z.object({
  event: z.string(),
  timestamp: z.string().datetime().optional(),
  payload: z.record(z.unknown()).optional(),
});

const bodySchema = z.object({
  events: z.array(eventSchema).min(1).max(100),
});

export const POST = withApiSecurity(async (request: NextRequest) => {
  const body = bodySchema.parse(await request.json());
  const provider = createTelemetryProvider();

  // Persist events for owner-facing analytics.
  await appendTelemetryEvents(
    body.events.map((event) => ({
      storeId: String(event.payload?.storeId ?? "demo-store"),
      event: event.event,
      timestamp: event.timestamp ?? new Date().toISOString(),
      payload: event.payload,
    }))
  );

  const results = await Promise.allSettled(
    body.events.map((event) =>
      provider.track({
        event: event.event,
        timestamp: event.timestamp ?? new Date().toISOString(),
        payload: event.payload,
      })
    )
  );

  const failed = results.filter((r) => r.status === "rejected").length;

  if (failed > 0) {
    console.error(`[analytics] ${failed}/${body.events.length} events failed to track`);
  }

  return NextResponse.json({ received: body.events.length, failed });
});
