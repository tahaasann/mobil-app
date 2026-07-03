import type { SyncOutboxEntry, SyncOutboxRepository } from '@/application/ports/sync-outbox.port';

const OUTBOX_META_KEY = 'sync_outbox_v1';

type StoredOutbox = {
  entries: SyncOutboxEntry[];
};

function parseStored(raw: string | null): StoredOutbox {
  if (!raw) {
    return { entries: [] };
  }

  try {
    const parsed = JSON.parse(raw) as StoredOutbox;
    return { entries: Array.isArray(parsed.entries) ? parsed.entries : [] };
  } catch {
    return { entries: [] };
  }
}

export class DrizzleSyncOutboxRepository implements SyncOutboxRepository {
  constructor(
    private readonly getMeta: (key: string) => Promise<string | null>,
    private readonly setMeta: (key: string, value: string) => Promise<void>,
  ) {}

  private async readAll(): Promise<SyncOutboxEntry[]> {
    return parseStored(await this.getMeta(OUTBOX_META_KEY)).entries;
  }

  private async writeAll(entries: SyncOutboxEntry[]): Promise<void> {
    await this.setMeta(OUTBOX_META_KEY, JSON.stringify({ entries }));
  }

  async list(userId: string): Promise<SyncOutboxEntry[]> {
    const entries = await this.readAll();
    return entries.filter((entry) => entry.userId === userId);
  }

  async enqueue(entry: SyncOutboxEntry): Promise<void> {
    const entries = await this.readAll();
    const withoutDuplicate = entries.filter(
      (existing) =>
        !(
          existing.userId === entry.userId &&
          existing.entity === entry.entity &&
          existing.recordId === entry.recordId
        ),
    );
    await this.writeAll([...withoutDuplicate, entry]);
  }

  async remove(entryId: string, userId: string): Promise<void> {
    const entries = await this.readAll();
    await this.writeAll(
      entries.filter((entry) => !(entry.id === entryId && entry.userId === userId)),
    );
  }

  async clear(userId: string): Promise<void> {
    const entries = await this.readAll();
    await this.writeAll(entries.filter((entry) => entry.userId !== userId));
  }
}
