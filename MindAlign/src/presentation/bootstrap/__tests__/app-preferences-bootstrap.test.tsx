import { render, screen, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { AppSettingsRepository } from '@/application/ports/app-settings-repository.port';
import { createDefaultAppSettings } from '@/domain/entities/app-settings';
import { AppPreferencesBootstrap } from '@/presentation/bootstrap/app-preferences-bootstrap';
import { useAppTheme } from '@/presentation/theme/theme-provider';

jest.mock('@/infrastructure/database/database-provider', () => ({
  useAppDatabase: () => ({}),
}));

jest.mock('nativewind', () => ({
  useColorScheme: () => ({
    setColorScheme: jest.fn(),
    toggleColorScheme: jest.fn(),
    colorScheme: 'light',
  }),
}));

function ThemeProbe() {
  const { preference } = useAppTheme();
  return <Text testID="theme-preference">{preference}</Text>;
}

function LocaleProbe() {
  const { i18n } = useTranslation();
  return <Text testID="boot-locale">{i18n.language}</Text>;
}

describe('AppPreferencesBootstrap', () => {
  it('hydrates theme and language from SQLite settings on boot (T-225/T-227)', async () => {
    const settings = {
      ...createDefaultAppSettings(),
      theme: 'dark' as const,
      language: 'tr' as const,
    };

    const repository: AppSettingsRepository = {
      get: jest.fn().mockResolvedValue(settings),
      save: jest.fn(),
    };

    await render(
      <AppPreferencesBootstrap settingsRepository={repository}>
        <ThemeProbe />
        <LocaleProbe />
      </AppPreferencesBootstrap>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('theme-preference')).toHaveTextContent('dark');
    });
    expect(screen.getByTestId('boot-locale')).toHaveTextContent('tr');
  });
});
