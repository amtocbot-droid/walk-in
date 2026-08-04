import { TelemetryProvider } from "./types";
import { ConsoleProvider } from "./console";
import { PostHogProvider, PostHogConfig } from "./posthog";
import { SegmentProvider, SegmentConfig } from "./segment";
import { Ga4Provider, Ga4Config } from "./ga4";

export * from "./types";
export { ConsoleProvider, PostHogProvider, SegmentProvider, Ga4Provider };

export interface TelemetryProviderConfig {
  name: "console" | "posthog" | "segment" | "ga4";
  posthog?: PostHogConfig;
  segment?: SegmentConfig;
  ga4?: Ga4Config;
}

export function createTelemetryProvider(): TelemetryProvider {
  const preferred = process.env.TELEMETRY_PROVIDER?.toLowerCase();

  if (preferred === "posthog" && process.env.POSTHOG_API_KEY) {
    return new PostHogProvider({
      apiKey: process.env.POSTHOG_API_KEY,
      host: process.env.POSTHOG_HOST,
      distinctId: process.env.TELEMETRY_DISTINCT_ID,
    });
  }

  if (preferred === "segment" && process.env.SEGMENT_WRITE_KEY) {
    return new SegmentProvider({
      writeKey: process.env.SEGMENT_WRITE_KEY,
      userId: process.env.TELEMETRY_DISTINCT_ID,
    });
  }

  if (
    preferred === "ga4" &&
    process.env.GA4_MEASUREMENT_ID &&
    process.env.GA4_API_SECRET
  ) {
    return new Ga4Provider({
      measurementId: process.env.GA4_MEASUREMENT_ID,
      apiSecret: process.env.GA4_API_SECRET,
      clientId: process.env.TELEMETRY_DISTINCT_ID,
    });
  }

  return new ConsoleProvider();
}
