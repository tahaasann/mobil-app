import type { SyncEntityType, SyncPort, SyncRecord } from '@/application/ports/sync.port';

export class InMemorySyncAdapter implements SyncPort {
  private store = new Map<string, Map<string, SyncRecord>>();

  private bucket(userId: string, entity: SyncEntityType) {
    const key = `${userId}:${entity}`;
    if (!this.store.has(key)) {
      this.store.set(key, new Map());
    }
    return this.store.get(key)!;
  }

  async push(userId: string, entity: SyncEntityType, records: SyncRecord[]): Promise<void> {
    const bucket = this.bucket(userId, entity);
    for (const record of records) {
      const existing = bucket.get(record.id);
      if (!existing || existing.updatedAt <= record.updatedAt) {
        bucket.set(record.id, record);
      }
    }
  }

  async pull(userId: string, entity: SyncEntityType, since?: string): Promise<SyncRecord[]> {
    const bucket = this.bucket(userId, entity);
    return [...bucket.values()].filter((record) => !since || record.updatedAt > since);
  }
}
