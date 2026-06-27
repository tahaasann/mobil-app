import type { Bookmark } from '@/domain/entities/bookmark';

export type BookmarkRepository = {
  findAll(): Promise<Bookmark[]>;
  findById(id: string): Promise<Bookmark | null>;
  save(bookmark: Bookmark): Promise<void>;
  delete(id: string): Promise<void>;
};
