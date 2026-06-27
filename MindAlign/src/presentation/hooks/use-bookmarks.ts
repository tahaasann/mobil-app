import { useCallback, useEffect, useState } from 'react';

import type { Bookmark } from '@/domain/entities/bookmark';
import { useAppContainer } from '@/infrastructure/di/app-container';

export function useBookmarks() {
  const { bookmarkUseCase } = useAppContainer();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      setBookmarks(await bookmarkUseCase.list());
    } finally {
      setIsLoading(false);
    }
  }, [bookmarkUseCase]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const removeBookmark = useCallback(
    async (id: string) => {
      await bookmarkUseCase.remove(id);
      await refresh();
    },
    [bookmarkUseCase, refresh],
  );

  return { bookmarks, isLoading, refresh, removeBookmark };
}
