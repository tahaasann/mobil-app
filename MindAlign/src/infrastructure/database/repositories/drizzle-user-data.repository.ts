import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';

import type { UserDataPort, UserDataSnapshot } from '@/application/ports/user-data.port';
import { createDefaultAppSettings } from '@/domain/entities/app-settings';

import * as schema from '../schema';

export class DrizzleUserDataRepository implements UserDataPort {
  constructor(private readonly db: ExpoSQLiteDatabase<typeof schema>) {}

  async exportSnapshot(): Promise<UserDataSnapshot> {
    const [settings, profile, habits, habitLogs, habitNotes, bookmarks, chatMessages, aiUsage] =
      await Promise.all([
        this.db.select().from(schema.appSettings),
        this.db.select().from(schema.userProfile),
        this.db.select().from(schema.habits),
        this.db.select().from(schema.habitLogs),
        this.db.select().from(schema.habitNotes),
        this.db.select().from(schema.bookmarks),
        this.db.select().from(schema.chatMessages),
        this.db.select().from(schema.aiUsage),
      ]);

    return {
      exportedAt: new Date().toISOString(),
      settings,
      profile,
      habits,
      habitLogs,
      habitNotes,
      bookmarks,
      chatMessages,
      aiUsage,
    };
  }

  async clearSessionData(): Promise<void> {
    await this.db.delete(schema.chatMessages);
    await this.db.delete(schema.bookmarks);
    await this.db.delete(schema.habitNotes);
    await this.db.delete(schema.habitLogs);
    await this.db.delete(schema.habits);
    await this.db.delete(schema.aiUsage);
    await this.db.delete(schema.userProfile);
  }

  async resetAll(): Promise<void> {
    await this.clearSessionData();
    const defaults = createDefaultAppSettings();
    await this.db.delete(schema.appSettings);
    await this.db.insert(schema.appSettings).values({
      id: defaults.id,
      selectedApproach: defaults.selectedApproach,
      language: defaults.language,
      theme: defaults.theme,
      onboardingCompleted: false,
      createdAt: defaults.createdAt.toISOString(),
    });
  }
}
