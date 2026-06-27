import type { AppSettings } from '@/domain/entities/app-settings';

export type AppSettingsRepository = {
  get(): Promise<AppSettings | null>;
  save(settings: AppSettings): Promise<void>;
};
