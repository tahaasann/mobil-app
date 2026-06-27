import type { ApproachLens } from '@/application/ports/ai-coach.port';
import type { AppLocale } from '@/presentation/i18n';
import type { ThemePreference } from '@/presentation/theme/resolve-theme';

export type AppSettings = {
  id: string;
  selectedApproach: ApproachLens;
  language: AppLocale;
  theme: ThemePreference;
  onboardingCompleted: boolean;
  createdAt: Date;
};

export type UpsertAppSettingsInput = {
  selectedApproach: ApproachLens;
  language: AppLocale;
  theme: ThemePreference;
  onboardingCompleted: boolean;
};

const DEFAULT_SETTINGS_ID = 'default';

export function createDefaultAppSettings(): AppSettings {
  return {
    id: DEFAULT_SETTINGS_ID,
    selectedApproach: 'universal',
    language: 'en',
    theme: 'auto',
    onboardingCompleted: false,
    createdAt: new Date(),
  };
}

export function upsertAppSettings(
  current: AppSettings | null,
  input: UpsertAppSettingsInput,
): AppSettings {
  const base = current ?? createDefaultAppSettings();

  return {
    ...base,
    selectedApproach: input.selectedApproach,
    language: input.language,
    theme: input.theme,
    onboardingCompleted: input.onboardingCompleted,
  };
}

export const APP_SETTINGS_ID = DEFAULT_SETTINGS_ID;
