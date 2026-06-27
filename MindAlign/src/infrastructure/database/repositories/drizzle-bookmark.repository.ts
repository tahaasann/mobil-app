import { eq } from 'drizzle-orm';
import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';

import type { BookmarkRepository } from '@/application/ports/bookmark-repository.port';
import type { Bookmark } from '@/domain/entities/bookmark';

import * as schema from '../schema';

export class DrizzleBookmarkRepository implements BookmarkRepository {
  constructor(private readonly db: ExpoSQLiteDatabase<typeof schema>) {}

  async findAll(): Promise<Bookmark[]> {
    const rows = await this.db.select().from(schema.bookmarks);
    return rows.map(mapRow).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async findById(id: string): Promise<Bookmark | null> {
    const rows = await this.db.select().from(schema.bookmarks).where(eq(schema.bookmarks.id, id));
    const row = rows[0];
    return row ? mapRow(row) : null;
  }

  async save(bookmark: Bookmark): Promise<void> {
    await this.db
      .insert(schema.bookmarks)
      .values({
        id: bookmark.id,
        habitId: bookmark.habitId,
        habitTitle: bookmark.habitTitle,
        content: bookmark.content,
        barrierLabel: bookmark.barrierLabel,
        microTask: bookmark.microTask,
        createdAt: bookmark.createdAt.toISOString(),
        updatedAt: bookmark.updatedAt.toISOString(),
      })
      .onConflictDoUpdate({
        target: schema.bookmarks.id,
        set: {
          habitId: bookmark.habitId,
          habitTitle: bookmark.habitTitle,
          content: bookmark.content,
          barrierLabel: bookmark.barrierLabel,
          microTask: bookmark.microTask,
          updatedAt: bookmark.updatedAt.toISOString(),
        },
      });
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(schema.bookmarks).where(eq(schema.bookmarks.id, id));
  }
}

function mapRow(row: typeof schema.bookmarks.$inferSelect): Bookmark {
  return {
    id: row.id,
    habitId: row.habitId,
    habitTitle: row.habitTitle,
    content: row.content,
    barrierLabel: row.barrierLabel,
    microTask: row.microTask,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  };
}
