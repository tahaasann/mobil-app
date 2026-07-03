import type { ChatMessage } from '@/domain/entities/chat-message';

export type ChatMessageRepository = {
  findByHabitId(habitId: string): Promise<ChatMessage[]>;
  findAll(): Promise<ChatMessage[]>;
  save(message: ChatMessage): Promise<void>;
  deleteByHabitId(habitId: string): Promise<void>;
};
