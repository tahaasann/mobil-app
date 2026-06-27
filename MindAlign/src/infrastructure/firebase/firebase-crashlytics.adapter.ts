import { getCrashlytics, log, recordError } from '@react-native-firebase/crashlytics';

import type { CrashReportingPort } from '@/application/ports/crash-reporting.port';

export class FirebaseCrashlyticsAdapter implements CrashReportingPort {
  log(message: string): void {
    log(getCrashlytics(), message);
  }

  recordError(error: Error, context?: Record<string, string>): void {
    const crashlytics = getCrashlytics();
    recordError(crashlytics, error, context?.message);
  }
}
