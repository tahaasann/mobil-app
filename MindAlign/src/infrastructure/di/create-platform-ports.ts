import type { AnalyticsPort } from '@/application/ports/analytics.port';
import type { CrashReportingPort } from '@/application/ports/crash-reporting.port';
import type { RemoteConfigPort } from '@/application/ports/remote-config.port';
import { FirebaseAnalyticsAdapter } from '@/infrastructure/firebase/firebase-analytics.adapter';
import { FirebaseCrashlyticsAdapter } from '@/infrastructure/firebase/firebase-crashlytics.adapter';
import { FirebaseRemoteConfigAdapter } from '@/infrastructure/firebase/firebase-remote-config.adapter';
import { MockAnalyticsAdapter } from '@/infrastructure/firebase/mock-analytics.adapter';
import { MockCrashReportingAdapter } from '@/infrastructure/firebase/mock-crash-reporting.adapter';
import { MockRemoteConfigAdapter } from '@/infrastructure/firebase/mock-remote-config.adapter';

export function createAnalyticsPort(): AnalyticsPort {
  if (process.env.EXPO_PUBLIC_ANALYTICS_MOCK === 'true') {
    return new MockAnalyticsAdapter();
  }
  return new FirebaseAnalyticsAdapter();
}

export function createCrashReportingPort(): CrashReportingPort {
  if (process.env.EXPO_PUBLIC_CRASHLYTICS_MOCK === 'true') {
    return new MockCrashReportingAdapter();
  }
  return new FirebaseCrashlyticsAdapter();
}

export function createRemoteConfigPort(): RemoteConfigPort {
  if (process.env.EXPO_PUBLIC_REMOTE_CONFIG_MOCK === 'true') {
    return new MockRemoteConfigAdapter();
  }
  return new FirebaseRemoteConfigAdapter();
}
