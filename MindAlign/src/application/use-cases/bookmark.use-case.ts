import type { BookmarkRepository } from '@/application/ports/bookmark-repository.port';
import { createBookmark, type CreateBookmarkInput } from '@/domain/entities/bookmark';

export class BookmarkUseCase {
  constructor(private readonly bookmarkRepository: BookmarkRepository) {}

  list() {
    return this.bookmarkRepository.findAll();
  }

  async add(input: CreateBookmarkInput) {
    const bookmark = createBookmark(input);
    await this.bookmarkRepository.save(bookmark);
    return bookmark;
  }

  async remove(id: string) {
    await this.bookmarkRepository.delete(id);
  }
}
