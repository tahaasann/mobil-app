import type { ChatMessageRepository } from '@/application/ports/chat-message-repository.port';
import { createChatMessage, type CreateChatMessageInput } from '@/domain/entities/chat-message';

export class SaveChatMessageUseCase {
  constructor(private readonly chatMessageRepository: ChatMessageRepository) {}

  execute(input: CreateChatMessageInput) {
    const message = createChatMessage(input);
    return this.chatMessageRepository.save(message).then(() => message);
  }
}

export class ListChatMessagesUseCase {
  constructor(private readonly chatMessageRepository: ChatMessageRepository) {}

  execute(habitId?: string) {
    if (habitId) {
      return this.chatMessageRepository.findByHabitId(habitId);
    }
    return this.chatMessageRepository.findAll();
  }
}
