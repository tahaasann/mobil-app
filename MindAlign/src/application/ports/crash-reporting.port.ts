export type CrashReportingPort = {
  log(message: string): void;
  recordError(error: Error, context?: Record<string, string>): void;
};
