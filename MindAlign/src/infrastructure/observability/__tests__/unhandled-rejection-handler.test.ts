import { MockCrashReportingAdapter } from '@/infrastructure/firebase/mock-crash-reporting.adapter';
import {
  installUnhandledRejectionHandler,
  reportUnhandledRejection,
} from '@/infrastructure/observability/unhandled-rejection-handler';

describe('unhandled rejection handler (T-235)', () => {
  it('records simulated unhandled rejections to Crashlytics port', () => {
    const crashReportingPort = new MockCrashReportingAdapter();

    reportUnhandledRejection(crashReportingPort, new Error('void promise failed'));

    expect(crashReportingPort.errors).toHaveLength(1);
    expect(crashReportingPort.errors[0]?.message).toBe('void promise failed');
  });

  it('installs a global handler that forwards rejections', () => {
    const crashReportingPort = new MockCrashReportingAdapter();
    const teardown = installUnhandledRejectionHandler(crashReportingPort);

    const globalWithHandler = globalThis as typeof globalThis & {
      onunhandledrejection?: ((event: { reason?: unknown }) => void) | null;
    };

    globalWithHandler.onunhandledrejection?.({ reason: new Error('global rejection') });
    expect(crashReportingPort.errors[0]?.message).toBe('global rejection');

    teardown();
  });
});
