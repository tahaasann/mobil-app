import type { ChatMessageRepository } from '@/application/ports/chat-message-repository.port';
import {
  chatMessageToSyncPayload,
  createChatMessage,
  type CreateChatMessageInput,
} from '@/domain/entities/chat-message';

import type { EnqueueSyncUseCase } from './sync-outbox.use-case';

export class SaveChatMessageUseCase {
  constructor(
    private readonly chatMessageRepository: ChatMessageRepository,
    private readonly enqueueSyncUseCase: EnqueueSyncUseCase,
  ) {}

  async execute(input: CreateChatMessageInput) {
    const message = createChatMessage(input);
    await this.chatMessageRepository.save(message);
    await this.enqueueSyncUseCase.execute({
      entity: 'chat_messages',
      recordId: message.id,
      operation: 'upsert',
      payload: chatMessageToSyncPayload(message),
    });
    return message;
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

export class ClearChatThreadUseCase {
  constructor(private readonly chatMessageRepository: ChatMessageRepository) {}

  execute(habitId: string): Promise<void> {
    return this.chatMessageRepository.deleteByHabitId(habitId);
  }
}
