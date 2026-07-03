import type { BookmarkRepository } from '@/application/ports/bookmark-repository.port';
import type { ChatMessageRepository } from '@/application/ports/chat-message-repository.port';
import type { SyncPort } from '@/application/ports/sync.port';
import { bookmarkToSyncPayload } from '@/domain/entities/bookmark';
import {
  chatMessageFromSyncPayload,
  chatMessageToSyncPayload,
} from '@/domain/entities/chat-message';
import { mergeBookmarksWithTombstones } from '@/domain/sync/merge-bookmarks';
import { mergeRecordsLastWriteWins } from '@/domain/sync/merge-records';

export class SyncOnLoginUseCase {
  constructor(
    private readonly syncPort: SyncPort,
    private readonly bookmarkRepository: BookmarkRepository,
    private readonly chatMessageRepository: ChatMessageRepository,
  ) {}

  async execute(userId: string): Promise<void> {
    await this.syncBookmarks(userId);
    await this.syncChatMessages(userId);
  }

  private async syncBookmarks(userId: string): Promise<void> {
    const local = await this.bookmarkRepository.findAll();
    const remoteRecords = await this.syncPort.pull(userId, 'bookmarks');
    const merged = mergeBookmarksWithTombstones(local, remoteRecords);
    for (const bookmark of merged) {
      await this.bookmarkRepository.save(bookmark);
    }

    await this.syncPort.push(
      userId,
      'bookmarks',
      merged.map((bookmark) => ({
        id: bookmark.id,
        updatedAt: bookmark.updatedAt.toISOString(),
        payload: bookmarkToSyncPayload(bookmark),
      })),
    );
  }

  private async syncChatMessages(userId: string): Promise<void> {
    const local = await this.chatMessageRepository.findAll();
    const remoteRecords = await this.syncPort.pull(userId, 'chat_messages');
    const remote = remoteRecords.map((record) => chatMessageFromSyncPayload(record.payload));

    const merged = mergeRecordsLastWriteWins(local, remote);
    for (const message of merged) {
      await this.chatMessageRepository.save(message);
    }

    await this.syncPort.push(
      userId,
      'chat_messages',
      merged.map((message) => ({
        id: message.id,
        updatedAt: message.updatedAt.toISOString(),
        payload: chatMessageToSyncPayload(message),
      })),
    );
  }
}
