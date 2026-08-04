import { TelemetryEvent } from "./telemetry/providers";

export type { TelemetryEvent } from "./telemetry/providers";

const EVENT_QUEUE: TelemetryEvent[] = [];
const MAX_QUEUE = 50;
let flushTimer: ReturnType<typeof setTimeout> | null = null;

export function trackEvent(event: string, payload?: Record<string, unknown>) {
  const entry: TelemetryEvent = {
    event,
    timestamp: new Date().toISOString(),
    payload,
  };

  if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    console.log("[telemetry]", entry);
  }

  EVENT_QUEUE.push(entry);

  if (EVENT_QUEUE.length >= MAX_QUEUE) {
    void flushTelemetry();
  } else {
    scheduleFlush();
  }
}

export async function flushTelemetry(): Promise<TelemetryEvent[]> {
  if (EVENT_QUEUE.length === 0) return [];
  const events = EVENT_QUEUE.splice(0, EVENT_QUEUE.length);

  if (typeof window === "undefined") {
    // Server-side: caller should use the provider directly. Keep events for diagnostics.
    return events;
  }

  try {
    const res = await fetch("/api/v1/analytics/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ events }),
      keepalive: true,
    });

    if (!res.ok) {
      console.error("Telemetry flush failed:", res.status);
    }
  } catch (err) {
    console.error("Telemetry flush error:", err);
  }

  return events;
}

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    void flushTelemetry();
  }, 2000);
}

if (typeof window !== "undefined") {
  window.addEventListener("pagehide", () => {
    if (EVENT_QUEUE.length > 0) {
      void flushTelemetry();
    }
  });
}
