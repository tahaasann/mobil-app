import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';

import type { UserProfileRepository } from '@/application/ports/user-profile-repository.port';
import type { UserProfile } from '@/domain/entities/user-profile';

import * as schema from '../schema';

export class DrizzleUserProfileRepository implements UserProfileRepository {
  constructor(private readonly db: ExpoSQLiteDatabase<typeof schema>) {}

  async get(): Promise<UserProfile | null> {
    const rows = await this.db.select().from(schema.userProfile).limit(1);
    const row = rows[0];
    return row ? mapRow(row) : null;
  }

  async save(profile: UserProfile): Promise<void> {
    await this.db
      .insert(schema.userProfile)
      .values({
        id: profile.id,
        identityGoal: profile.identityGoal,
        defaultTone: profile.defaultTone,
        commonBarrier: profile.commonBarrier,
        notifWindow: profile.notifWindow,
        notifFrequency: profile.notifFrequency,
        updatedAt: profile.updatedAt.toISOString(),
      })
      .onConflictDoUpdate({
        target: schema.userProfile.id,
        set: {
          identityGoal: profile.identityGoal,
          defaultTone: profile.defaultTone,
          commonBarrier: profile.commonBarrier,
          notifWindow: profile.notifWindow,
          notifFrequency: profile.notifFrequency,
          updatedAt: profile.updatedAt.toISOString(),
        },
      });
  }
}

function mapRow(row: typeof schema.userProfile.$inferSelect): UserProfile {
  return {
    id: row.id,
    identityGoal: row.identityGoal,
    defaultTone: row.defaultTone as UserProfile['defaultTone'],
    commonBarrier: row.commonBarrier,
    notifWindow: row.notifWindow,
    notifFrequency: row.notifFrequency,
    updatedAt: new Date(row.updatedAt),
  };
}
