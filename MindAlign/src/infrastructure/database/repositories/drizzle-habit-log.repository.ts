import { and, eq, inArray } from 'drizzle-orm';
import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';

import type { HabitLogRepository } from '@/application/ports/habit-log-repository.port';
import type { HabitLog } from '@/domain/entities/habit-log';

import * as schema from '../schema';

export class DrizzleHabitLogRepository implements HabitLogRepository {
  constructor(private readonly db: ExpoSQLiteDatabase<typeof schema>) {}

  async upsert(log: HabitLog): Promise<void> {
    const existing = await this.findByHabitIdAndDate(log.habitId, log.date);

    if (existing) {
      await this.db
        .update(schema.habitLogs)
        .set({
          status: log.status,
          excuseText: log.excuseText ?? null,
          barrierLabel: log.barrierLabel ?? null,
          rescueTaskText: log.rescueTaskText ?? null,
          createdAt: log.createdAt.toISOString(),
        })
        .where(eq(schema.habitLogs.id, existing.id));
      return;
    }

    await this.db.insert(schema.habitLogs).values({
      id: log.id,
      habitId: log.habitId,
      date: log.date,
      status: log.status,
      excuseText: log.excuseText ?? null,
      barrierLabel: log.barrierLabel ?? null,
      rescueTaskText: log.rescueTaskText ?? null,
      createdAt: log.createdAt.toISOString(),
    });
  }

  async findByHabitIds(habitIds: string[]): Promise<HabitLog[]> {
    if (habitIds.length === 0) {
      return [];
    }

    const rows = await this.db
      .select()
      .from(schema.habitLogs)
      .where(inArray(schema.habitLogs.habitId, habitIds));

    return rows.map(mapRowToLog);
  }

  async findByHabitIdsAndDates(habitIds: string[], dates: string[]): Promise<HabitLog[]> {
    if (habitIds.length === 0 || dates.length === 0) {
      return [];
    }

    const rows = await this.db
      .select()
      .from(schema.habitLogs)
      .where(
        and(inArray(schema.habitLogs.habitId, habitIds), inArray(schema.habitLogs.date, dates)),
      );

    return rows.map(mapRowToLog);
  }

  async findByHabitIdAndDate(habitId: string, date: string): Promise<HabitLog | null> {
    const rows = await this.db
      .select()
      .from(schema.habitLogs)
      .where(and(eq(schema.habitLogs.habitId, habitId), eq(schema.habitLogs.date, date)));

    const row = rows[0];
    return row ? mapRowToLog(row) : null;
  }
}

function mapRowToLog(row: typeof schema.habitLogs.$inferSelect): HabitLog {
  return {
    id: row.id,
    habitId: row.habitId,
    date: row.date,
    status: row.status as HabitLog['status'],
    excuseText: row.excuseText,
    barrierLabel: row.barrierLabel,
    rescueTaskText: row.rescueTaskText,
    createdAt: new Date(row.createdAt),
  };
}
