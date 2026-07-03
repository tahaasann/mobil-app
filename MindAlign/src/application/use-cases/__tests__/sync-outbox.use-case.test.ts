import {
  EnqueueSyncUseCase,
  FlushSyncOutboxUseCase,
} from '@/application/use-cases/sync-outbox.use-case';
import {
  ACTIVE_AUTH_IS_ANONYMOUS_KEY,
  ACTIVE_AUTH_USER_ID_KEY,
} from '@/application/use-cases/auth-session.use-case';
import type { AppMetaRepository } from '@/application/ports/app-meta-repository.port';
import { InMemorySyncAdapter } from '@/infrastructure/firebase/in-memory-sync.adapter';
import { DrizzleSyncOutboxRepository } from '@/infrastructure/database/repositories/drizzle-sync-outbox.repository';

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

describe('sync outbox use cases', () => {
  it('enqueues bookmark changes for registered users only', async () => {
    const { appMetaRepository } = createMetaStore();
    const syncOutboxRepository = new DrizzleSyncOutboxRepository(
      (key) => appMetaRepository.get(key),
      (key, value) => appMetaRepository.set(key, value),
    );
    const enqueue = new EnqueueSyncUseCase(syncOutboxRepository, appMetaRepository);

    await appMetaRepository.set(ACTIVE_AUTH_USER_ID_KEY, 'user-1');
    await appMetaRepository.set(ACTIVE_AUTH_IS_ANONYMOUS_KEY, 'false');

    await enqueue.execute({
      entity: 'bookmarks',
      recordId: 'bookmark-1',
      operation: 'upsert',
      payload: { id: 'bookmark-1', content: 'Tip' },
    });

    const entries = await syncOutboxRepository.list('user-1');
    expect(entries).toHaveLength(1);
    expect(entries[0]?.recordId).toBe('bookmark-1');
  });

  it('skips enqueue for anonymous users', async () => {
    const { appMetaRepository } = createMetaStore();
    const syncOutboxRepository = new DrizzleSyncOutboxRepository(
      (key) => appMetaRepository.get(key),
      (key, value) => appMetaRepository.set(key, value),
    );
    const enqueue = new EnqueueSyncUseCase(syncOutboxRepository, appMetaRepository);

    await appMetaRepository.set(ACTIVE_AUTH_USER_ID_KEY, 'guest-1');
    await appMetaRepository.set(ACTIVE_AUTH_IS_ANONYMOUS_KEY, 'true');

    await enqueue.execute({
      entity: 'bookmarks',
      recordId: 'bookmark-1',
      operation: 'upsert',
      payload: { id: 'bookmark-1', content: 'Tip' },
    });

    expect(await syncOutboxRepository.list('guest-1')).toEqual([]);
  });

  it('flushes queued records to sync port', async () => {
    const { appMetaRepository } = createMetaStore();
    const syncOutboxRepository = new DrizzleSyncOutboxRepository(
      (key) => appMetaRepository.get(key),
      (key, value) => appMetaRepository.set(key, value),
    );
    const syncPort = new InMemorySyncAdapter();
    const flush = new FlushSyncOutboxUseCase(syncOutboxRepository, syncPort);
    const enqueue = new EnqueueSyncUseCase(syncOutboxRepository, appMetaRepository);

    await appMetaRepository.set(ACTIVE_AUTH_USER_ID_KEY, 'user-1');
    await appMetaRepository.set(ACTIVE_AUTH_IS_ANONYMOUS_KEY, 'false');
    await enqueue.execute({
      entity: 'chat_messages',
      recordId: 'msg-1',
      operation: 'upsert',
      payload: { id: 'msg-1', content: 'Hello' },
    });

    await flush.execute('user-1');

    const remote = await syncPort.pull('user-1', 'chat_messages');
    expect(remote).toHaveLength(1);
    expect(await syncOutboxRepository.list('user-1')).toEqual([]);
  });
});
