import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import type { AnalyticsPort } from '@/application/ports/analytics.port';
import type { CrashReportingPort } from '@/application/ports/crash-reporting.port';
import type { RemoteConfigPort, RemoteConfigValues } from '@/application/ports/remote-config.port';
import { FREE_WEEKLY_AI_QUOTA, PREMIUM_WEEKLY_AI_QUOTA } from '@/domain/ai/ai-quota';
import { GEMINI_MODEL } from '@/infrastructure/firebase/firebase-ai.constants';
import { FirebaseAnalyticsAdapter } from '@/infrastructure/firebase/firebase-analytics.adapter';
import { FirebaseCrashlyticsAdapter } from '@/infrastructure/firebase/firebase-crashlytics.adapter';
import { FirebaseRemoteConfigAdapter } from '@/infrastructure/firebase/firebase-remote-config.adapter';
import { MockAnalyticsAdapter } from '@/infrastructure/firebase/mock-analytics.adapter';
import { MockCrashReportingAdapter } from '@/infrastructure/firebase/mock-crash-reporting.adapter';
import { MockRemoteConfigAdapter } from '@/infrastructure/firebase/mock-remote-config.adapter';

type PlatformPorts = {
  analyticsPort: AnalyticsPort;
  crashReportingPort: CrashReportingPort;
  remoteConfigPort: RemoteConfigPort;
  remoteConfigValues: RemoteConfigValues;
};

const DEFAULT_REMOTE_CONFIG: RemoteConfigValues = {
  freeWeeklyQuota: FREE_WEEKLY_AI_QUOTA,
  premiumWeeklyQuota: PREMIUM_WEEKLY_AI_QUOTA,
  geminiModel: GEMINI_MODEL,
};

const PlatformContext = createContext<PlatformPorts | null>(null);

function createAnalyticsPort(): AnalyticsPort {
  if (process.env.EXPO_PUBLIC_ANALYTICS_MOCK === 'true') {
    return new MockAnalyticsAdapter();
  }
  return new FirebaseAnalyticsAdapter();
}

function createCrashReportingPort(): CrashReportingPort {
  if (process.env.EXPO_PUBLIC_CRASHLYTICS_MOCK === 'true') {
    return new MockCrashReportingAdapter();
  }
  return new FirebaseCrashlyticsAdapter();
}

function createRemoteConfigPort(): RemoteConfigPort {
  if (process.env.EXPO_PUBLIC_REMOTE_CONFIG_MOCK === 'true') {
    return new MockRemoteConfigAdapter();
  }
  return new FirebaseRemoteConfigAdapter();
}

export function PlatformContainer({ children }: { children: ReactNode }) {
  const analyticsPort = useMemo(() => createAnalyticsPort(), []);
  const crashReportingPort = useMemo(() => createCrashReportingPort(), []);
  const remoteConfigPort = useMemo(() => createRemoteConfigPort(), []);
  const [remoteConfigValues, setRemoteConfigValues] =
    useState<RemoteConfigValues>(DEFAULT_REMOTE_CONFIG);

  useEffect(() => {
    void (async () => {
      try {
        await remoteConfigPort.configure();
        await remoteConfigPort.fetchAndActivate();
        setRemoteConfigValues(await remoteConfigPort.getValues());
        analyticsPort.logEvent('app_open');
      } catch (error) {
        crashReportingPort.recordError(
          error instanceof Error ? error : new Error('platform_init_failed'),
        );
      }
    })();
  }, [analyticsPort, crashReportingPort, remoteConfigPort]);

  const value = useMemo<PlatformPorts>(
    () => ({
      analyticsPort,
      crashReportingPort,
      remoteConfigPort,
      remoteConfigValues,
    }),
    [analyticsPort, crashReportingPort, remoteConfigPort, remoteConfigValues],
  );

  return <PlatformContext.Provider value={value}>{children}</PlatformContext.Provider>;
}

export function usePlatformPorts(): PlatformPorts {
  const context = useContext(PlatformContext);
  if (!context) {
    throw new Error('usePlatformPorts must be used within PlatformContainer');
  }
  return context;
}
