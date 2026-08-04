export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const events = body.events ?? [];

    // For high-frequency telemetry, don't store in KV (hits daily limits).
    // In production, use Cloudflare Analytics Engine or an external service.
    // For now, just acknowledge receipt and log for debugging.

    if (events.length > 0) {
      console.log(`[analytics] received ${events.length} events`, events.slice(0, 3));
    }

    return Response.json({ received: events.length, failed: 0 });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Invalid request" },
      { status: 400 }
    );
  }
}

export async function onRequestGet() {
  return Response.json({ error: "Method not allowed" }, { status: 405 });
}
