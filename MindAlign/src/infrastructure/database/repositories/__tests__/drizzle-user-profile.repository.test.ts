import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';

import { APP_SETTINGS_ID, createDefaultAppSettings } from '@/domain/entities/app-settings';
import { DrizzleAppSettingsRepository } from '@/infrastructure/database/repositories/drizzle-app-settings.repository';
import { DrizzleUserProfileRepository } from '@/infrastructure/database/repositories/drizzle-user-profile.repository';
import * as schema from '@/infrastructure/database/schema';

describe('DrizzleUserProfileRepository', () => {
  it('creates and reads a profile row', async () => {
    const values: unknown[] = [];
    const rows = [
      {
        id: 'default',
        identityGoal: 'Calm parent',
        defaultTone: 'direct',
        commonBarrier: 'no_time',
        notifWindow: 'morning',
        notifFrequency: 1,
        updatedAt: '2026-06-26T00:00:00.000Z',
      },
    ];

    const db = {
      insert: jest.fn().mockReturnValue({
        values: jest.fn().mockReturnValue({
          onConflictDoUpdate: jest.fn(async (payload: unknown) => {
            values.push(payload);
          }),
        }),
      }),
      select: jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue(rows),
        }),
      }),
    } as unknown as ExpoSQLiteDatabase<typeof schema>;

    const repository = new DrizzleUserProfileRepository(db);
    const profile = {
      id: 'default',
      identityGoal: 'Calm parent',
      defaultTone: 'direct' as const,
      commonBarrier: 'no_time',
      notifWindow: 'morning',
      notifFrequency: 1,
      updatedAt: new Date('2026-06-26T00:00:00.000Z'),
    };

    await repository.save(profile);
    const loaded = await repository.get();

    expect(values).toHaveLength(1);
    expect(loaded?.identityGoal).toBe('Calm parent');
    expect(loaded?.defaultTone).toBe('direct');
  });
});

describe('DrizzleAppSettingsRepository', () => {
  it('creates and reads settings row', async () => {
    const db = {
      insert: jest.fn().mockReturnValue({
        values: jest.fn().mockReturnValue({
          onConflictDoUpdate: jest.fn(async () => undefined),
        }),
      }),
      select: jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([
            {
              id: APP_SETTINGS_ID,
              selectedApproach: 'spiritual',
              language: 'tr',
              theme: 'auto',
              onboardingCompleted: true,
              createdAt: '2026-06-26T00:00:00.000Z',
            },
          ]),
        }),
      }),
    } as unknown as ExpoSQLiteDatabase<typeof schema>;

    const repository = new DrizzleAppSettingsRepository(db);
    await repository.save({
      ...createDefaultAppSettings(),
      selectedApproach: 'spiritual',
      language: 'tr',
      onboardingCompleted: true,
    });
    const loaded = await repository.get();

    expect(loaded?.selectedApproach).toBe('spiritual');
    expect(loaded?.onboardingCompleted).toBe(true);
  });
});
