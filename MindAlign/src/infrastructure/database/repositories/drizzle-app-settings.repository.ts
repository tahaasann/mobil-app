import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';

import type { AppSettingsRepository } from '@/application/ports/app-settings-repository.port';
import type { AppSettings } from '@/domain/entities/app-settings';

import * as schema from '../schema';

export class DrizzleAppSettingsRepository implements AppSettingsRepository {
  constructor(private readonly db: ExpoSQLiteDatabase<typeof schema>) {}

  async get(): Promise<AppSettings | null> {
    const rows = await this.db.select().from(schema.appSettings).limit(1);
    const row = rows[0];
    return row ? mapRow(row) : null;
  }

  async save(settings: AppSettings): Promise<void> {
    await this.db
      .insert(schema.appSettings)
      .values({
        id: settings.id,
        selectedApproach: settings.selectedApproach,
        language: settings.language,
        theme: settings.theme,
        onboardingCompleted: settings.onboardingCompleted,
        createdAt: settings.createdAt.toISOString(),
      })
      .onConflictDoUpdate({
        target: schema.appSettings.id,
        set: {
          selectedApproach: settings.selectedApproach,
          language: settings.language,
          theme: settings.theme,
          onboardingCompleted: settings.onboardingCompleted,
        },
      });
  }
}

function mapRow(row: typeof schema.appSettings.$inferSelect): AppSettings {
  return {
    id: row.id,
    selectedApproach: row.selectedApproach as AppSettings['selectedApproach'],
    language: row.language as AppSettings['language'],
    theme: row.theme as AppSettings['theme'],
    onboardingCompleted: row.onboardingCompleted,
    createdAt: new Date(row.createdAt),
  };
}
