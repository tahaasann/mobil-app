import { useCallback, useEffect, useState } from 'react';

import type { AppSettings } from '@/domain/entities/app-settings';
import { useAppContainer } from '@/infrastructure/di/app-container';

export function useAppSettings() {
  const { getAppSettingsUseCase } = useAppContainer();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    void getAppSettingsUseCase.execute().then(
      (result) => {
        if (!cancelled) {
          setSettings(result);
          setIsLoading(false);
        }
      },
      () => {
        if (!cancelled) {
          setIsLoading(false);
        }
      },
    );

    return () => {
      cancelled = true;
    };
  }, [getAppSettingsUseCase]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      setSettings(await getAppSettingsUseCase.execute());
    } finally {
      setIsLoading(false);
    }
  }, [getAppSettingsUseCase]);

  return { settings, isLoading, refresh };
}
