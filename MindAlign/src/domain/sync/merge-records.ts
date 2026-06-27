export function mergeRecordsLastWriteWins<T extends { id: string; updatedAt: Date }>(
  local: T[],
  remote: T[],
): T[] {
  const merged = new Map<string, T>();

  for (const item of local) {
    merged.set(item.id, item);
  }

  for (const item of remote) {
    const existing = merged.get(item.id);
    if (!existing || existing.updatedAt <= item.updatedAt) {
      merged.set(item.id, item);
    }
  }

  return [...merged.values()].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
}
