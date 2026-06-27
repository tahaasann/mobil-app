import { eq } from 'drizzle-orm';
import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';

import type { AppMetaRepository } from '@/application/ports/app-meta-repository.port';

import * as schema from '../schema';

export class DrizzleAppMetaRepository implements AppMetaRepository {
  constructor(private readonly db: ExpoSQLiteDatabase<typeof schema>) {}

  async get(key: string): Promise<string | null> {
    const rows = await this.db.select().from(schema.appMeta).where(eq(schema.appMeta.key, key));
    return rows[0]?.value ?? null;
  }

  async set(key: string, value: string): Promise<void> {
    const existing = await this.get(key);
    if (existing === null) {
      await this.db.insert(schema.appMeta).values({ key, value });
      return;
    }

    await this.db.update(schema.appMeta).set({ value }).where(eq(schema.appMeta.key, key));
  }

  async delete(key: string): Promise<void> {
    await this.db.delete(schema.appMeta).where(eq(schema.appMeta.key, key));
  }
}
