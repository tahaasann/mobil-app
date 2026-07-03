import type { AppSettings } from '@/domain/entities/app-settings';
import type { AppLocale } from '@/presentation/i18n';
import type { ThemePreference } from '@/presentation/theme/resolve-theme';

export type BootPreferences = {
  language: AppLocale;
  theme: ThemePreference;
};

export function resolveBootPreferences(settings: AppSettings | null): BootPreferences {
  return {
    language: settings?.language ?? 'en',
    theme: settings?.theme ?? 'auto',
  };
}
