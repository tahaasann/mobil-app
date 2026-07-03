import { useCallback, useEffect, useState } from 'react';

import type { HabitDetailResult } from '@/application/use-cases/get-habit-detail.use-case';
import { todayUtc } from '@/domain/utils/date';
import { useAppContainer } from '@/infrastructure/di/app-container';

export function useHabitDetail(habitId: string) {
  const {
    getHabitDetailUseCase,
    updateHabitUseCase,
    archiveHabitUseCase,
    addHabitNoteUseCase,
    deleteHabitNoteUseCase,
  } = useAppContainer();
  const [detail, setDetail] = useState<HabitDetailResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!habitId) {
      setDetail(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await getHabitDetailUseCase.execute({
        habitId,
        referenceDate: todayUtc(),
      });
      setDetail(result);
    } catch (err) {
      setDetail(null);
      setError(err instanceof Error ? err.message : 'Failed to load habit');
    } finally {
      setIsLoading(false);
    }
  }, [getHabitDetailUseCase, habitId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const updateHabit = useCallback(
    async (input: { title: string; description: string }) => {
      await updateHabitUseCase.execute({
        habitId,
        title: input.title,
        description: input.description.trim() || null,
      });
      await refresh();
    },
    [habitId, refresh, updateHabitUseCase],
  );

  const archiveHabit = useCallback(async () => {
    await archiveHabitUseCase.execute(habitId);
  }, [archiveHabitUseCase, habitId]);

  const addNote = useCallback(
    async (content: string) => {
      await addHabitNoteUseCase.execute({ habitId, content });
      await refresh();
    },
    [addHabitNoteUseCase, habitId, refresh],
  );

  const deleteNote = useCallback(
    async (noteId: string) => {
      await deleteHabitNoteUseCase.execute(noteId);
      await refresh();
    },
    [deleteHabitNoteUseCase, refresh],
  );

  return {
    detail,
    isLoading,
    error,
    refresh,
    updateHabit,
    archiveHabit,
    addNote,
    deleteNote,
  };
}
