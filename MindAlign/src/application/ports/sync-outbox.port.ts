import type { SyncEntityType } from '@/application/ports/sync.port';

export type SyncOutboxOperation = 'upsert' | 'delete';

export type SyncOutboxEntry = {
  id: string;
  userId: string;
  entity: SyncEntityType;
  recordId: string;
  operation: SyncOutboxOperation;
  payload: Record<string, unknown>;
  updatedAt: string;
};

export interface SyncOutboxRepository {
  list(userId: string): Promise<SyncOutboxEntry[]>;
  enqueue(entry: SyncOutboxEntry): Promise<void>;
  remove(entryId: string, userId: string): Promise<void>;
  clear(userId: string): Promise<void>;
}
