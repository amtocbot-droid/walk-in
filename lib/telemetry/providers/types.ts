export interface TelemetryEvent {
  event: string;
  timestamp: string;
  payload?: Record<string, unknown>;
}

export interface TelemetryProvider {
  readonly name: string;
  track(event: TelemetryEvent): Promise<void> | void;
  identify?(userId: string, traits?: Record<string, unknown>): Promise<void> | void;
}
