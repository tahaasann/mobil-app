export type SyncEntityType = 'bookmarks' | 'chat_messages';

export type SyncRecord = {
  id: string;
  updatedAt: string;
  payload: Record<string, unknown>;
};

export type SyncPort = {
  push(userId: string, entity: SyncEntityType, records: SyncRecord[]): Promise<void>;
  pull(userId: string, entity: SyncEntityType, since?: string): Promise<SyncRecord[]>;
};
