import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';

import { DrizzleHealthAdapter } from '@/infrastructure/database/drizzle-health.adapter';
import * as schema from '@/infrastructure/database/schema';

describe('DrizzleHealthAdapter', () => {
  it('ping resolves when select succeeds', async () => {
    const limit = jest.fn().mockResolvedValue([]);
    const from = jest.fn().mockReturnValue({ limit });
    const select = jest.fn().mockReturnValue({ from });
    const db = { select } as unknown as ExpoSQLiteDatabase<typeof schema>;

    const adapter = new DrizzleHealthAdapter(db);
    await expect(adapter.ping()).resolves.toBeUndefined();
    expect(select).toHaveBeenCalled();
  });

  it('ping rejects when select fails', async () => {
    const db = {
      select: jest.fn().mockImplementation(() => {
        throw new Error('db error');
      }),
    } as unknown as ExpoSQLiteDatabase<typeof schema>;

    await expect(new DrizzleHealthAdapter(db).ping()).rejects.toThrow('db error');
  });
});
