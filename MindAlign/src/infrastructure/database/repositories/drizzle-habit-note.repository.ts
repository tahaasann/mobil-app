import { desc, eq } from 'drizzle-orm';
import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';

import type { HabitNoteRepository } from '@/application/ports/habit-note-repository.port';
import type { HabitNote } from '@/domain/entities/habit-note';

import * as schema from '../schema';

export class DrizzleHabitNoteRepository implements HabitNoteRepository {
  constructor(private readonly db: ExpoSQLiteDatabase<typeof schema>) {}

  async findByHabitId(habitId: string): Promise<HabitNote[]> {
    const rows = await this.db
      .select()
      .from(schema.habitNotes)
      .where(eq(schema.habitNotes.habitId, habitId))
      .orderBy(desc(schema.habitNotes.createdAt));

    return rows.map(mapRow);
  }

  async save(note: HabitNote): Promise<void> {
    await this.db.insert(schema.habitNotes).values({
      id: note.id,
      habitId: note.habitId,
      content: note.content,
      createdAt: note.createdAt.toISOString(),
    });
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(schema.habitNotes).where(eq(schema.habitNotes.id, id));
  }
}

function mapRow(row: typeof schema.habitNotes.$inferSelect): HabitNote {
  return {
    id: row.id,
    habitId: row.habitId,
    content: row.content,
    createdAt: new Date(row.createdAt),
  };
}
