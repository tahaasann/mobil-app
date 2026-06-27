import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';

import { createHabit } from '@/domain/entities/habit';
import { DrizzleHabitRepository } from '@/infrastructure/database/repositories/drizzle-habit.repository';
import * as schema from '@/infrastructure/database/schema';

describe('DrizzleHabitRepository', () => {
  it('creates and finds active habits', async () => {
    const values: unknown[] = [];
    const rows = [
      {
        id: 'habit-1',
        title: 'Stretch',
        description: null,
        schedule: 'daily',
        isActive: true,
        sortOrder: 0,
        createdAt: '2026-06-26T00:00:00.000Z',
      },
    ];

    const db = {
      insert: jest.fn().mockReturnValue({
        values: jest.fn(async (payload: unknown) => {
          values.push(payload);
        }),
      }),
      select: jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(rows),
        }),
      }),
    } as unknown as ExpoSQLiteDatabase<typeof schema>;

    const repository = new DrizzleHabitRepository(db);
    const habit = createHabit({ title: 'Stretch' });

    await repository.create(habit);
    const active = await repository.findAllActive();

    expect(values).toHaveLength(1);
    expect(active[0]?.title).toBe('Stretch');
  });
});
