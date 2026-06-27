import { eq } from 'drizzle-orm';
import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';

import type { AiUsageRepository } from '@/application/ports/ai-usage-repository.port';
import { nextAiQuotaCount } from '@/domain/ai/ai-quota';

import * as schema from '../schema';

export class DrizzleAiUsageRepository implements AiUsageRepository {
  constructor(private readonly db: ExpoSQLiteDatabase<typeof schema>) {}

  async getCountForWeek(weekStart: string): Promise<number> {
    const rows = await this.db
      .select()
      .from(schema.aiUsage)
      .where(eq(schema.aiUsage.weekStart, weekStart));

    return rows[0]?.count ?? 0;
  }

  async incrementForWeek(weekStart: string): Promise<number> {
    const existing = await this.getCountForWeek(weekStart);
    const nextCount = nextAiQuotaCount(existing);
    const now = new Date().toISOString();

    if (existing === 0) {
      await this.db.insert(schema.aiUsage).values({
        weekStart,
        count: nextCount,
        updatedAt: now,
      });
      return nextCount;
    }

    await this.db
      .update(schema.aiUsage)
      .set({ count: nextCount, updatedAt: now })
      .where(eq(schema.aiUsage.weekStart, weekStart));

    return nextCount;
  }
}
