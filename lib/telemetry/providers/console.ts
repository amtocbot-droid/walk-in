import { TelemetryEvent, TelemetryProvider } from "./types";

export class ConsoleProvider implements TelemetryProvider {
  readonly name = "console";

  track(event: TelemetryEvent): void {
    console.log("[telemetry]", event);
  }
}
