import { ClearChatThreadUseCase } from '@/application/use-cases/chat-message.use-case';
import type { ChatMessageRepository } from '@/application/ports/chat-message-repository.port';

class InMemoryChatMessageRepository implements ChatMessageRepository {
  deletedHabitIds: string[] = [];

  async findByHabitId(): Promise<[]> {
    return [];
  }

  async findAll(): Promise<[]> {
    return [];
  }

  async save(): Promise<void> {}

  async deleteByHabitId(habitId: string): Promise<void> {
    this.deletedHabitIds.push(habitId);
  }
}

describe('ClearChatThreadUseCase', () => {
  it('deletes messages for the active habit thread', async () => {
    const repository = new InMemoryChatMessageRepository();
    const useCase = new ClearChatThreadUseCase(repository);

    await useCase.execute('general');

    expect(repository.deletedHabitIds).toEqual(['general']);
  });
});
