import type { AppMetaRepository } from '@/application/ports/app-meta-repository.port';
import type { SyncOutboxRepository } from '@/application/ports/sync-outbox.port';
import type { SyncEntityType, SyncPort } from '@/application/ports/sync.port';

import { ACTIVE_AUTH_IS_ANONYMOUS_KEY, ACTIVE_AUTH_USER_ID_KEY } from './auth-session.use-case';

function createOutboxEntryId(): string {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `outbox-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}

export class EnqueueSyncUseCase {
  constructor(
    private readonly syncOutboxRepository: SyncOutboxRepository,
    private readonly appMetaRepository: AppMetaRepository,
  ) {}

  async execute(input: {
    entity: SyncEntityType;
    recordId: string;
    operation: 'upsert' | 'delete';
    payload: Record<string, unknown>;
  }): Promise<void> {
    const userId = await this.appMetaRepository.get(ACTIVE_AUTH_USER_ID_KEY);
    const isAnonymous = (await this.appMetaRepository.get(ACTIVE_AUTH_IS_ANONYMOUS_KEY)) === 'true';

    if (!userId || isAnonymous) {
      return;
    }

    await this.syncOutboxRepository.enqueue({
      id: createOutboxEntryId(),
      userId,
      entity: input.entity,
      recordId: input.recordId,
      operation: input.operation,
      payload: input.payload,
      updatedAt: new Date().toISOString(),
    });
  }
}

export class FlushSyncOutboxUseCase {
  constructor(
    private readonly syncOutboxRepository: SyncOutboxRepository,
    private readonly syncPort: SyncPort,
  ) {}

  async execute(userId: string): Promise<void> {
    const entries = await this.syncOutboxRepository.list(userId);

    for (const entry of entries) {
      if (entry.operation === 'delete') {
        await this.syncPort.push(userId, entry.entity, [
          {
            id: entry.recordId,
            updatedAt: entry.updatedAt,
            payload: entry.payload,
          },
        ]);
      } else {
        await this.syncPort.push(userId, entry.entity, [
          {
            id: entry.recordId,
            updatedAt: entry.updatedAt,
            payload: entry.payload,
          },
        ]);
      }
      await this.syncOutboxRepository.remove(entry.id, userId);
    }
  }
}
