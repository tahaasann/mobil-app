import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';

import type { HealthRepository } from '@/application/ports/health-repository.port';

import * as schema from './schema';

export class DrizzleHealthAdapter implements HealthRepository {
  constructor(private readonly db: ExpoSQLiteDatabase<typeof schema>) {}

  async ping(): Promise<void> {
    await this.db.select().from(schema.appMeta).limit(1);
  }
}
