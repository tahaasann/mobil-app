import {
  createAnalyticsPort,
  createCrashReportingPort,
  createRemoteConfigPort,
} from '@/infrastructure/di/create-platform-ports';
import { FirebaseAnalyticsAdapter } from '@/infrastructure/firebase/firebase-analytics.adapter';
import { FirebaseCrashlyticsAdapter } from '@/infrastructure/firebase/firebase-crashlytics.adapter';
import { FirebaseRemoteConfigAdapter } from '@/infrastructure/firebase/firebase-remote-config.adapter';
import { MockAnalyticsAdapter } from '@/infrastructure/firebase/mock-analytics.adapter';
import { MockCrashReportingAdapter } from '@/infrastructure/firebase/mock-crash-reporting.adapter';
import { MockRemoteConfigAdapter } from '@/infrastructure/firebase/mock-remote-config.adapter';

describe('create-platform-ports', () => {
  afterEach(() => {
    delete process.env.EXPO_PUBLIC_ANALYTICS_MOCK;
    delete process.env.EXPO_PUBLIC_CRASHLYTICS_MOCK;
    delete process.env.EXPO_PUBLIC_REMOTE_CONFIG_MOCK;
  });

  it('returns Firebase analytics adapter by default', () => {
    expect(createAnalyticsPort()).toBeInstanceOf(FirebaseAnalyticsAdapter);
  });

  it('returns mock analytics adapter when ANALYTICS_MOCK=true', () => {
    process.env.EXPO_PUBLIC_ANALYTICS_MOCK = 'true';
    expect(createAnalyticsPort()).toBeInstanceOf(MockAnalyticsAdapter);
  });

  it('returns Firebase crash reporting adapter by default', () => {
    expect(createCrashReportingPort()).toBeInstanceOf(FirebaseCrashlyticsAdapter);
  });

  it('returns mock crash reporting adapter when CRASHLYTICS_MOCK=true', () => {
    process.env.EXPO_PUBLIC_CRASHLYTICS_MOCK = 'true';
    expect(createCrashReportingPort()).toBeInstanceOf(MockCrashReportingAdapter);
  });

  it('returns Firebase remote config adapter by default', () => {
    expect(createRemoteConfigPort()).toBeInstanceOf(FirebaseRemoteConfigAdapter);
  });

  it('returns mock remote config adapter when REMOTE_CONFIG_MOCK=true', () => {
    process.env.EXPO_PUBLIC_REMOTE_CONFIG_MOCK = 'true';
    expect(createRemoteConfigPort()).toBeInstanceOf(MockRemoteConfigAdapter);
  });
});
