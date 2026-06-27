import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';

import { createChatMessage } from '@/domain/entities/chat-message';
import { DrizzleChatMessageRepository } from '@/infrastructure/database/repositories/drizzle-chat-message.repository';
import * as schema from '@/infrastructure/database/schema';

describe('DrizzleChatMessageRepository', () => {
  it('saves and loads chat messages by habit', async () => {
    const rows = [
      {
        id: 'chat-1',
        habitId: 'habit-1',
        role: 'user',
        content: 'Too tired',
        createdAt: '2026-06-27T00:00:00.000Z',
        updatedAt: '2026-06-27T00:00:00.000Z',
      },
    ];

    const db = {
      insert: jest.fn().mockReturnValue({
        values: jest.fn().mockReturnValue({
          onConflictDoUpdate: jest.fn(async () => undefined),
        }),
      }),
      select: jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(rows),
        }),
      }),
    } as unknown as ExpoSQLiteDatabase<typeof schema>;

    const repository = new DrizzleChatMessageRepository(db);
    const message = createChatMessage({
      habitId: 'habit-1',
      role: 'user',
      content: 'Too tired',
    });

    await repository.save(message);
    const loaded = await repository.findByHabitId('habit-1');

    expect(loaded[0]?.content).toBe('Too tired');
  });
});
