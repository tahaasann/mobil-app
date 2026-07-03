import { mergeBookmarksWithTombstones } from '@/domain/sync/merge-bookmarks';
import type { Bookmark } from '@/domain/entities/bookmark';

describe('mergeBookmarksWithTombstones', () => {
  const local: Bookmark[] = [
    {
      id: 'b1',
      habitId: null,
      habitTitle: null,
      content: 'Local tip',
      barrierLabel: null,
      microTask: null,
      createdAt: new Date('2026-06-28T10:00:00.000Z'),
      updatedAt: new Date('2026-06-28T10:00:00.000Z'),
    },
  ];

  it('removes bookmarks deleted remotely via tombstone', () => {
    const merged = mergeBookmarksWithTombstones(local, [
      {
        id: 'b1',
        updatedAt: '2026-06-29T12:00:00.000Z',
        payload: { id: 'b1', deleted: true, updatedAt: '2026-06-29T12:00:00.000Z' },
      },
    ]);

    expect(merged).toEqual([]);
  });

  it('keeps local bookmark when it is newer than tombstone', () => {
    const merged = mergeBookmarksWithTombstones(local, [
      {
        id: 'b1',
        updatedAt: '2026-06-27T12:00:00.000Z',
        payload: { id: 'b1', deleted: true, updatedAt: '2026-06-27T12:00:00.000Z' },
      },
    ]);

    expect(merged).toHaveLength(1);
    expect(merged[0]?.id).toBe('b1');
  });
});
