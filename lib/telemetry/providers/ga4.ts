import { TelemetryEvent, TelemetryProvider } from "./types";

export interface Ga4Config {
  measurementId: string;
  apiSecret: string;
  clientId?: string;
}

export class Ga4Provider implements TelemetryProvider {
  readonly name = "ga4";
  private config: Ga4Config;

  constructor(config: Ga4Config) {
    this.config = config;
  }

  async track(event: TelemetryEvent): Promise<void> {
    const url = new URL("https://www.google-analytics.com/mp/collect");
    url.searchParams.set("api_secret", this.config.apiSecret);
    url.searchParams.set("measurement_id", this.config.measurementId);

    const params: Record<string, string | number> = {};
    for (const [key, value] of Object.entries(event.payload ?? {})) {
      if (typeof value === "string" || typeof value === "number") {
        params[key] = value;
      }
    }

    const res = await fetch(url.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: this.config.clientId ?? "anonymous",
        events: [
          {
            name: sanitizeEventName(event.event),
            params,
          },
        ],
      }),
    });

    if (!res.ok) {
      throw new Error(`GA4 track failed: ${res.status}`);
    }
  }
}

function sanitizeEventName(name: string): string {
  // GA4 event names must be alphanumeric plus underscores.
  return name.replace(/[^a-zA-Z0-9_]/g, "_").slice(0, 40);
}
