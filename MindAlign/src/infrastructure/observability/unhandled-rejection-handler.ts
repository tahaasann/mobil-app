import type { CrashReportingPort } from '@/application/ports/crash-reporting.port';

type RejectionHandler = (reason: unknown) => void;

let installed = false;

export function installUnhandledRejectionHandler(
  crashReportingPort: CrashReportingPort,
): () => void {
  if (installed) {
    return () => undefined;
  }

  installed = true;

  const handler: RejectionHandler = (reason) => {
    const error = reason instanceof Error ? reason : new Error(String(reason));
    crashReportingPort.recordError(error, { source: 'unhandled_promise' });
  };

  const globalWithHandler = globalThis as typeof globalThis & {
    onunhandledrejection?: ((event: { reason?: unknown }) => void) | null;
  };

  const previous = globalWithHandler.onunhandledrejection ?? null;

  globalWithHandler.onunhandledrejection = (event) => {
    handler(event.reason);
    previous?.(event);
  };

  return () => {
    globalWithHandler.onunhandledrejection = previous;
    installed = false;
  };
}

export function reportUnhandledRejection(
  crashReportingPort: CrashReportingPort,
  reason: unknown,
): void {
  const error = reason instanceof Error ? reason : new Error(String(reason));
  crashReportingPort.recordError(error, { source: 'unhandled_promise' });
}
