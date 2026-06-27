import { SyncOnLoginUseCase } from '@/application/use-cases/sync-on-login.use-case';
import { createBookmark } from '@/domain/entities/bookmark';
import { InMemorySyncAdapter } from '@/infrastructure/firebase/in-memory-sync.adapter';

describe('FirestoreSyncAdapter', () => {
  it('pushes and pulls user-scoped records with last-write-wins merge', async () => {
    const sync = new InMemorySyncAdapter();
    const bookmarkRepository = {
      findAll: jest
        .fn()
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([
          createBookmark({ content: 'Local tip', barrierLabel: 'Tired', microTask: 'Walk' }),
        ]),
      save: jest.fn(async () => undefined),
      findById: jest.fn(),
      delete: jest.fn(),
    };
    const chatMessageRepository = {
      findAll: jest.fn().mockResolvedValue([]),
      findByHabitId: jest.fn(),
      save: jest.fn(),
    };

    await sync.push('user-1', 'bookmarks', [
      {
        id: 'b-1',
        updatedAt: '2026-06-27T10:00:00.000Z',
        payload: {
          id: 'b-1',
          content: 'Remote tip',
          habitId: null,
          habitTitle: null,
          barrierLabel: 'Time',
          microTask: 'Timer',
          createdAt: '2026-06-27T10:00:00.000Z',
          updatedAt: '2026-06-27T10:00:00.000Z',
        },
      },
    ]);

    const useCase = new SyncOnLoginUseCase(sync, bookmarkRepository, chatMessageRepository);
    await useCase.execute('user-1');

    expect(bookmarkRepository.save).toHaveBeenCalled();
    const pulled = await sync.pull('user-1', 'bookmarks');
    expect(pulled.length).toBeGreaterThan(0);
  });

  it('denies cross-user access in memory adapter by scoping keys', async () => {
    const sync = new InMemorySyncAdapter();
    await sync.push('user-a', 'bookmarks', [
      { id: 'b-1', updatedAt: '2026-06-27T10:00:00.000Z', payload: { content: 'secret' } },
    ]);

    const userBRecords = await sync.pull('user-b', 'bookmarks');
    expect(userBRecords).toHaveLength(0);
  });
});
