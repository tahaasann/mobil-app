import type { CrashReportingPort } from '@/application/ports/crash-reporting.port';

export class MockCrashReportingAdapter implements CrashReportingPort {
  logs: string[] = [];
  errors: Error[] = [];

  log(message: string): void {
    this.logs.push(message);
  }

  recordError(error: Error, _context?: Record<string, string>): void {
    this.errors.push(error);
  }
}
