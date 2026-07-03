import type { BookmarkRepository } from '@/application/ports/bookmark-repository.port';
import {
  bookmarkToSyncPayload,
  createBookmark,
  type CreateBookmarkInput,
} from '@/domain/entities/bookmark';

import type { EnqueueSyncUseCase } from './sync-outbox.use-case';

export class BookmarkUseCase {
  constructor(
    private readonly bookmarkRepository: BookmarkRepository,
    private readonly enqueueSyncUseCase: EnqueueSyncUseCase,
  ) {}

  list() {
    return this.bookmarkRepository.findAll();
  }

  async add(input: CreateBookmarkInput) {
    const bookmark = createBookmark(input);
    await this.bookmarkRepository.save(bookmark);
    await this.enqueueSyncUseCase.execute({
      entity: 'bookmarks',
      recordId: bookmark.id,
      operation: 'upsert',
      payload: bookmarkToSyncPayload(bookmark),
    });
    return bookmark;
  }

  async remove(id: string) {
    const existing = await this.bookmarkRepository.findById(id);
    await this.bookmarkRepository.delete(id);
    if (existing) {
      await this.enqueueSyncUseCase.execute({
        entity: 'bookmarks',
        recordId: id,
        operation: 'delete',
        payload: {
          id,
          deleted: true,
          updatedAt: new Date().toISOString(),
        },
      });
    }
  }
}
