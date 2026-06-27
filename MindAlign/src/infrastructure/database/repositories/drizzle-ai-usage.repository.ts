import { eq } from 'drizzle-orm';
import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';

import type { AiUsageRepository, AiWeekUsage } from '@/application/ports/ai-usage-repository.port';
import { nextAiQuotaCount } from '@/domain/ai/ai-quota';

import * as schema from '../schema';

export class DrizzleAiUsageRepository implements AiUsageRepository {
  constructor(private readonly db: ExpoSQLiteDatabase<typeof schema>) {}

  async getUsageForWeek(weekStart: string): Promise<AiWeekUsage> {
    const rows = await this.db
      .select()
      .from(schema.aiUsage)
      .where(eq(schema.aiUsage.weekStart, weekStart));

    return {
      count: rows[0]?.count ?? 0,
      bonusCount: rows[0]?.bonusCount ?? 0,
    };
  }

  async incrementForWeek(weekStart: string): Promise<number> {
    const usage = await this.getUsageForWeek(weekStart);
    const nextCount = nextAiQuotaCount(usage.count);
    const now = new Date().toISOString();

    if (usage.count === 0 && usage.bonusCount === 0) {
      await this.db.insert(schema.aiUsage).values({
        weekStart,
        count: nextCount,
        bonusCount: 0,
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

  async addBonusForWeek(weekStart: string): Promise<number> {
    const usage = await this.getUsageForWeek(weekStart);
    const nextBonus = usage.bonusCount + 1;
    const now = new Date().toISOString();

    if (usage.count === 0 && usage.bonusCount === 0) {
      await this.db.insert(schema.aiUsage).values({
        weekStart,
        count: 0,
        bonusCount: nextBonus,
        updatedAt: now,
      });
      return nextBonus;
    }

    await this.db
      .update(schema.aiUsage)
      .set({ bonusCount: nextBonus, updatedAt: now })
      .where(eq(schema.aiUsage.weekStart, weekStart));

    return nextBonus;
  }
}
