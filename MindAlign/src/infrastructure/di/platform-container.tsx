import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import type { AnalyticsPort } from '@/application/ports/analytics.port';
import type { CrashReportingPort } from '@/application/ports/crash-reporting.port';
import type { RemoteConfigPort, RemoteConfigValues } from '@/application/ports/remote-config.port';
import { FREE_WEEKLY_AI_QUOTA, PREMIUM_WEEKLY_AI_QUOTA } from '@/domain/ai/ai-quota';
import { GEMINI_LITE_MODEL, GEMINI_MODEL } from '@/infrastructure/firebase/firebase-ai.constants';
import {
  createAnalyticsPort,
  createCrashReportingPort,
  createRemoteConfigPort,
} from '@/infrastructure/di/create-platform-ports';
import { installUnhandledRejectionHandler } from '@/infrastructure/observability/unhandled-rejection-handler';

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
  geminiLiteModel: GEMINI_LITE_MODEL,
  aiEnabled: true,
  serverAiQuotaEnabled: false,
};

const PlatformContext = createContext<PlatformPorts | null>(null);

export function PlatformContainer({ children }: { children: ReactNode }) {
  const analyticsPort = useMemo(() => createAnalyticsPort(), []);
  const crashReportingPort = useMemo(() => createCrashReportingPort(), []);
  const remoteConfigPort = useMemo(() => createRemoteConfigPort(), []);
  const [remoteConfigValues, setRemoteConfigValues] =
    useState<RemoteConfigValues>(DEFAULT_REMOTE_CONFIG);

  useEffect(() => {
    return installUnhandledRejectionHandler(crashReportingPort);
  }, [crashReportingPort]);

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
