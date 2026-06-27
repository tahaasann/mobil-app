import { BookmarkUseCase } from '@/application/use-cases/bookmark.use-case';
import { createBookmark } from '@/domain/entities/bookmark';

describe('BookmarkUseCase', () => {
  it('adds, lists, and removes bookmarks', async () => {
    const saved: unknown[] = [];
    const repository = {
      findAll: jest.fn().mockResolvedValue([]),
      findById: jest.fn(),
      save: jest.fn(async (bookmark) => {
        saved.push(bookmark);
      }),
      delete: jest.fn(),
    };

    const useCase = new BookmarkUseCase(repository);
    const bookmark = await useCase.add({
      content: 'Take a 2-minute walk',
      barrierLabel: 'Tired',
      microTask: 'Walk indoors',
    });

    expect(bookmark.content).toBe('Take a 2-minute walk');
    repository.findAll.mockResolvedValueOnce([bookmark]);
    const list = await useCase.list();
    expect(list).toHaveLength(1);

    await useCase.remove(bookmark.id);
    expect(repository.delete).toHaveBeenCalledWith(bookmark.id);
  });

  it('creates bookmark entity with habit context', () => {
    const bookmark = createBookmark({
      habitId: 'habit-1',
      habitTitle: 'Meditate',
      content: 'Reflection text',
    });
    expect(bookmark.habitTitle).toBe('Meditate');
  });
});
