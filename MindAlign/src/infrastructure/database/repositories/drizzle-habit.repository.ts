import { eq } from 'drizzle-orm';
import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';

import type { HabitRepository } from '@/application/ports/habit-repository.port';
import type { Habit } from '@/domain/entities/habit';

import * as schema from '../schema';

export class DrizzleHabitRepository implements HabitRepository {
  constructor(private readonly db: ExpoSQLiteDatabase<typeof schema>) {}

  async create(habit: Habit): Promise<void> {
    await this.db.insert(schema.habits).values({
      id: habit.id,
      title: habit.title,
      description: habit.description,
      schedule: habit.schedule,
      isActive: habit.isActive,
      sortOrder: habit.sortOrder,
      createdAt: habit.createdAt.toISOString(),
    });
  }

  async findAllActive(): Promise<Habit[]> {
    const rows = await this.db.select().from(schema.habits).where(eq(schema.habits.isActive, true));

    return rows.map(mapRowToHabit);
  }

  async findById(id: string): Promise<Habit | null> {
    const rows = await this.db.select().from(schema.habits).where(eq(schema.habits.id, id));
    const row = rows[0];
    return row ? mapRowToHabit(row) : null;
  }

  async update(habit: Habit): Promise<void> {
    await this.db
      .update(schema.habits)
      .set({
        title: habit.title,
        description: habit.description,
        schedule: habit.schedule,
        isActive: habit.isActive,
        sortOrder: habit.sortOrder,
      })
      .where(eq(schema.habits.id, habit.id));
  }

  async archive(id: string): Promise<void> {
    await this.db.update(schema.habits).set({ isActive: false }).where(eq(schema.habits.id, id));
  }
}

function mapRowToHabit(row: typeof schema.habits.$inferSelect): Habit {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    schedule: row.schedule as Habit['schedule'],
    isActive: row.isActive,
    sortOrder: row.sortOrder,
    createdAt: new Date(row.createdAt),
  };
}
