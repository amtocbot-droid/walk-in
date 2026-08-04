import { TelemetryEvent, TelemetryProvider } from "./types";

export interface SegmentConfig {
  writeKey: string;
  userId?: string;
}

export class SegmentProvider implements TelemetryProvider {
  readonly name = "segment";
  private config: SegmentConfig;

  constructor(config: SegmentConfig) {
    this.config = config;
  }

  async track(event: TelemetryEvent): Promise<void> {
    const auth = Buffer.from(`${this.config.writeKey}:`).toString("base64");
    const res = await fetch("https://api.segment.io/v1/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        event: event.event,
        userId: this.config.userId ?? "anonymous",
        properties: event.payload ?? {},
        timestamp: event.timestamp,
      }),
    });

    if (!res.ok) {
      throw new Error(`Segment track failed: ${res.status}`);
    }
  }
}
