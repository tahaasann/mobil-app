import { eq } from 'drizzle-orm';
import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';

import type { ChatMessageRepository } from '@/application/ports/chat-message-repository.port';
import type { ChatMessage } from '@/domain/entities/chat-message';

import * as schema from '../schema';

export class DrizzleChatMessageRepository implements ChatMessageRepository {
  constructor(private readonly db: ExpoSQLiteDatabase<typeof schema>) {}

  async findByHabitId(habitId: string): Promise<ChatMessage[]> {
    const rows = await this.db
      .select()
      .from(schema.chatMessages)
      .where(eq(schema.chatMessages.habitId, habitId));
    return rows.map(mapRow).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async findAll(): Promise<ChatMessage[]> {
    const rows = await this.db.select().from(schema.chatMessages);
    return rows.map(mapRow).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async save(message: ChatMessage): Promise<void> {
    await this.db
      .insert(schema.chatMessages)
      .values({
        id: message.id,
        habitId: message.habitId,
        role: message.role,
        content: message.content,
        createdAt: message.createdAt.toISOString(),
        updatedAt: message.updatedAt.toISOString(),
      })
      .onConflictDoUpdate({
        target: schema.chatMessages.id,
        set: {
          habitId: message.habitId,
          role: message.role,
          content: message.content,
          updatedAt: message.updatedAt.toISOString(),
        },
      });
  }

  async deleteByHabitId(habitId: string): Promise<void> {
    await this.db.delete(schema.chatMessages).where(eq(schema.chatMessages.habitId, habitId));
  }
}

function mapRow(row: typeof schema.chatMessages.$inferSelect): ChatMessage {
  return {
    id: row.id,
    habitId: row.habitId,
    role: row.role as ChatMessage['role'],
    content: row.content,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  };
}
