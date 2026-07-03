import {
  ACTIVE_AUTH_IS_ANONYMOUS_KEY,
  ACTIVE_AUTH_USER_ID_KEY,
  HandleAuthSessionUseCase,
  SignOutSessionUseCase,
} from '@/application/use-cases/auth-session.use-case';
import { FlushSyncOutboxUseCase } from '@/application/use-cases/sync-outbox.use-case';
import type { AppMetaRepository } from '@/application/ports/app-meta-repository.port';
import type { SyncOutboxRepository } from '@/application/ports/sync-outbox.port';
import type { SyncPort } from '@/application/ports/sync.port';
import { InMemorySyncAdapter } from '@/infrastructure/firebase/in-memory-sync.adapter';

function createMetaStore() {
  const store = new Map<string, string>();
  const appMetaRepository: AppMetaRepository = {
    get: async (key) => store.get(key) ?? null,
    set: async (key, value) => {
      store.set(key, value);
    },
    delete: async (key) => {
      store.delete(key);
    },
  };
  return { store, appMetaRepository };
}

describe('SignOutSessionUseCase', () => {
  it('does not wipe local session data on sign out', async () => {
    const { appMetaRepository } = createMetaStore();
    const clearSessionData = jest.fn();
    const notificationPort = { cancelAll: jest.fn(async () => undefined) };
    const subscriptionPort = { identifyUser: jest.fn(async () => undefined) };
    const syncOutboxRepository: SyncOutboxRepository = {
      list: jest.fn(async () => []),
      enqueue: jest.fn(async () => undefined),
      remove: jest.fn(async () => undefined),
      clear: jest.fn(async () => undefined),
    };
    const flushSyncOutboxUseCase = new FlushSyncOutboxUseCase(
      syncOutboxRepository,
      new InMemorySyncAdapter(),
    );

    await appMetaRepository.set(ACTIVE_AUTH_USER_ID_KEY, 'user-1');
    await appMetaRepository.set(ACTIVE_AUTH_IS_ANONYMOUS_KEY, 'true');

    const useCase = new SignOutSessionUseCase(
      notificationPort as never,
      subscriptionPort as never,
      appMetaRepository,
      flushSyncOutboxUseCase,
    );

    await useCase.execute();

    expect(clearSessionData).not.toHaveBeenCalled();
    expect(await appMetaRepository.get(ACTIVE_AUTH_USER_ID_KEY)).toBe('');
    expect(subscriptionPort.identifyUser).toHaveBeenCalledWith(null);
  });

  it('flushes sync outbox for registered users before sign out', async () => {
    const { appMetaRepository } = createMetaStore();
    const syncPort: SyncPort = new InMemorySyncAdapter();
    const syncOutboxRepository: SyncOutboxRepository = {
      list: jest.fn(async () => [
        {
          id: 'entry-1',
          userId: 'user-1',
          entity: 'bookmarks',
          recordId: 'bookmark-1',
          operation: 'upsert',
          payload: { id: 'bookmark-1', content: 'Saved tip' },
          updatedAt: '2026-06-29T10:00:00.000Z',
        },
      ]),
      enqueue: jest.fn(async () => undefined),
      remove: jest.fn(async () => undefined),
      clear: jest.fn(async () => undefined),
    };
    const flushSyncOutboxUseCase = new FlushSyncOutboxUseCase(syncOutboxRepository, syncPort);

    await appMetaRepository.set(ACTIVE_AUTH_USER_ID_KEY, 'user-1');
    await appMetaRepository.set(ACTIVE_AUTH_IS_ANONYMOUS_KEY, 'false');

    const useCase = new SignOutSessionUseCase(
      { cancelAll: jest.fn(async () => undefined) } as never,
      { identifyUser: jest.fn(async () => undefined) } as never,
      appMetaRepository,
      flushSyncOutboxUseCase,
    );

    await useCase.execute();

    const remote = await syncPort.pull('user-1', 'bookmarks');
    expect(remote).toHaveLength(1);
    expect(syncOutboxRepository.remove).toHaveBeenCalledWith('entry-1', 'user-1');
  });
});

describe('HandleAuthSessionUseCase', () => {
  it('clears local session data when a different user signs in', async () => {
    const { appMetaRepository } = createMetaStore();
    const clearSessionData = jest.fn(async () => undefined);
    const syncOnLoginUseCase = { execute: jest.fn(async () => undefined) };

    await appMetaRepository.set(ACTIVE_AUTH_USER_ID_KEY, 'user-a');

    const useCase = new HandleAuthSessionUseCase(
      appMetaRepository,
      { clearSessionData } as never,
      { cancelAll: jest.fn(async () => undefined) } as never,
      syncOnLoginUseCase as never,
      { identifyUser: jest.fn(async () => undefined) } as never,
    );

    await useCase.execute({
      id: 'user-b',
      email: 'b@example.com',
      isAnonymous: false,
      displayName: null,
    });

    expect(clearSessionData).toHaveBeenCalled();
    expect(syncOnLoginUseCase.execute).toHaveBeenCalledWith('user-b');
  });
});
