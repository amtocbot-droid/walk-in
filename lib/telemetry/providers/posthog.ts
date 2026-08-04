import { TelemetryEvent, TelemetryProvider } from "./types";

export interface PostHogConfig {
  apiKey: string;
  host?: string; // e.g., https://us.i.posthog.com or https://eu.i.posthog.com
  distinctId?: string;
}

export class PostHogProvider implements TelemetryProvider {
  readonly name = "posthog";
  private config: PostHogConfig;

  constructor(config: PostHogConfig) {
    this.config = config;
  }

  async track(event: TelemetryEvent): Promise<void> {
    const url = `${this.config.host ?? "https://us.i.posthog.com"}/capture/`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: this.config.apiKey,
        event: event.event,
        distinct_id: this.config.distinctId ?? "anonymous",
        properties: event.payload ?? {},
        timestamp: event.timestamp,
      }),
    });

    if (!res.ok) {
      throw new Error(`PostHog track failed: ${res.status}`);
    }
  }
}
