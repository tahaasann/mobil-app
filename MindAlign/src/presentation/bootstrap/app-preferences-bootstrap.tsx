import { useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, View } from 'react-native';

import type { AppSettingsRepository } from '@/application/ports/app-settings-repository.port';
import { useAppDatabase } from '@/infrastructure/database/database-provider';
import { DrizzleAppSettingsRepository } from '@/infrastructure/database/repositories/drizzle-app-settings.repository';
import {
  resolveBootPreferences,
  type BootPreferences,
} from '@/presentation/bootstrap/load-boot-preferences';
import { I18nProvider } from '@/presentation/i18n/i18n-provider';
import { AppThemeProvider } from '@/presentation/theme/theme-provider';

type AppPreferencesBootstrapProps = {
  children: ReactNode;
  settingsRepository?: AppSettingsRepository;
};

export function AppPreferencesBootstrap({
  children,
  settingsRepository,
}: AppPreferencesBootstrapProps) {
  const db = useAppDatabase();
  const repository = settingsRepository ?? new DrizzleAppSettingsRepository(db);
  const [boot, setBoot] = useState<BootPreferences | null>(null);

  useEffect(() => {
    let cancelled = false;

    void repository.get().then((settings) => {
      if (!cancelled) {
        setBoot(resolveBootPreferences(settings));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [repository]);

  if (!boot) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <I18nProvider locale={boot.language}>
      <AppThemeProvider initialPreference={boot.theme}>{children}</AppThemeProvider>
    </I18nProvider>
  );
}
