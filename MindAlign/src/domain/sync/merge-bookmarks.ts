import type { SyncRecord } from '@/application/ports/sync.port';
import type { Bookmark } from '@/domain/entities/bookmark';
import { bookmarkFromSyncPayload } from '@/domain/entities/bookmark';

import { mergeRecordsLastWriteWins } from './merge-records';

export function isSyncTombstone(payload: Record<string, unknown>): boolean {
  return payload.deleted === true;
}

export function mergeBookmarksWithTombstones(
  local: Bookmark[],
  remoteRecords: SyncRecord[],
): Bookmark[] {
  const deletedAtById = new Map<string, string>();
  const remoteBookmarks: Bookmark[] = [];

  for (const record of remoteRecords) {
    if (isSyncTombstone(record.payload)) {
      deletedAtById.set(record.id, record.updatedAt);
      continue;
    }
    remoteBookmarks.push(bookmarkFromSyncPayload(record.payload));
  }

  const merged = mergeRecordsLastWriteWins(local, remoteBookmarks);

  return merged.filter((bookmark) => {
    const tombstoneAt = deletedAtById.get(bookmark.id);
    if (!tombstoneAt) {
      return true;
    }
    return bookmark.updatedAt.toISOString() > tombstoneAt;
  });
}

export function createBookmarkDeleteTombstone(id: string, updatedAt = new Date()): SyncRecord {
  return {
    id,
    updatedAt: updatedAt.toISOString(),
    payload: {
      id,
      deleted: true,
      updatedAt: updatedAt.toISOString(),
    },
  };
}
