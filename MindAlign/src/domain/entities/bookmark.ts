export type Bookmark = {
  id: string;
  habitId: string | null;
  habitTitle: string | null;
  content: string;
  barrierLabel: string | null;
  microTask: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateBookmarkInput = {
  habitId?: string | null;
  habitTitle?: string | null;
  content: string;
  barrierLabel?: string | null;
  microTask?: string | null;
};

function createId(): string {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `bookmark-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}

export function createBookmark(input: CreateBookmarkInput): Bookmark {
  const now = new Date();
  return {
    id: createId(),
    habitId: input.habitId ?? null,
    habitTitle: input.habitTitle ?? null,
    content: input.content.trim(),
    barrierLabel: input.barrierLabel ?? null,
    microTask: input.microTask ?? null,
    createdAt: now,
    updatedAt: now,
  };
}

export function bookmarkToSyncPayload(bookmark: Bookmark): Record<string, unknown> {
  return {
    id: bookmark.id,
    habitId: bookmark.habitId,
    habitTitle: bookmark.habitTitle,
    content: bookmark.content,
    barrierLabel: bookmark.barrierLabel,
    microTask: bookmark.microTask,
    createdAt: bookmark.createdAt.toISOString(),
    updatedAt: bookmark.updatedAt.toISOString(),
  };
}

export function bookmarkFromSyncPayload(payload: Record<string, unknown>): Bookmark {
  return {
    id: String(payload.id),
    habitId: payload.habitId ? String(payload.habitId) : null,
    habitTitle: payload.habitTitle ? String(payload.habitTitle) : null,
    content: String(payload.content ?? ''),
    barrierLabel: payload.barrierLabel ? String(payload.barrierLabel) : null,
    microTask: payload.microTask ? String(payload.microTask) : null,
    createdAt: new Date(String(payload.createdAt)),
    updatedAt: new Date(String(payload.updatedAt)),
  };
}
