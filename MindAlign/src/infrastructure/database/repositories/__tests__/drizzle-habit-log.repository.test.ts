import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';

import { createHabitLog } from '@/domain/entities/habit-log';
import { DrizzleHabitLogRepository } from '@/infrastructure/database/repositories/drizzle-habit-log.repository';
import * as schema from '@/infrastructure/database/schema';

describe('DrizzleHabitLogRepository', () => {
  it('inserts a new log when none exists for the date', async () => {
    const insertValues = jest.fn().mockResolvedValue(undefined);
    const db = {
      select: jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      }),
      insert: jest.fn().mockReturnValue({ values: insertValues }),
      update: jest.fn(),
    } as unknown as ExpoSQLiteDatabase<typeof schema>;

    const repository = new DrizzleHabitLogRepository(db);
    const log = createHabitLog({ habitId: 'habit-1', date: '2026-06-26', status: 'success' });

    await repository.upsert(log);

    expect(insertValues).toHaveBeenCalled();
  });
});
