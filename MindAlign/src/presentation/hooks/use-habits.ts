import { eq } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useCallback, useEffect, useMemo, useState } from 'react';

import type { DashboardHabit } from '@/application/use-cases/get-dashboard.use-case';
import { habitAccentToSortOrder } from '@/domain/entities/habit-accent';
import { todayUtc } from '@/domain/utils/date';
import { habits } from '@/infrastructure/database/schema';
import { useAppDatabase } from '@/infrastructure/database/database-provider';
import { useAppContainer } from '@/infrastructure/di/app-container';
import { createNotificationContentBuilder } from '@/presentation/notifications/notification-content';
import type { CreateHabitFormInput } from '@/presentation/habits/create-habit-form.types';
import { useTranslation } from 'react-i18next';

export function useHabits() {
  const db = useAppDatabase();
  const { t } = useTranslation();
  const {
    getDashboardUseCase,
    createHabitUseCase,
    logHabitUseCase,
    getUserProfileUseCase,
    scheduleHabitNotificationsUseCase,
  } = useAppContainer();
  const [dashboard, setDashboard] = useState<DashboardHabit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const activeHabitsQuery = useLiveQuery(db.select().from(habits).where(eq(habits.isActive, true)));

  const refresh = useCallback(async () => {
    const result = await getDashboardUseCase.execute({ referenceDate: todayUtc() });
    setDashboard(result.habits);
    setIsLoading(false);
  }, [getDashboardUseCase]);

  useEffect(() => {
    let cancelled = false;

    void getDashboardUseCase.execute({ referenceDate: todayUtc() }).then((result) => {
      if (!cancelled) {
        setDashboard(result.habits);
        setIsLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [getDashboardUseCase, activeHabitsQuery.data]);

  const actions = useMemo(
    () => ({
      createHabit: async (input: CreateHabitFormInput | string) => {
        const payload: CreateHabitFormInput =
          typeof input === 'string' ? { title: input } : input;

        const habit = await createHabitUseCase.execute({
          title: payload.title,
          description: payload.description,
          sortOrder: habitAccentToSortOrder(payload.accent ?? 'neutral'),
        });

        if (payload.enableReminders !== false) {
          const profile = await getUserProfileUseCase.execute();
          await scheduleHabitNotificationsUseCase.execute({
            habit,
            profile,
            content: createNotificationContentBuilder(t),
          });
        }

        await refresh();
      },
      markDoneToday: async (habitId: string) => {
        await logHabitUseCase.execute({
          habitId,
          date: todayUtc(),
          status: 'success',
        });
        await refresh();
      },
      refresh,
    }),
    [
      createHabitUseCase,
      getUserProfileUseCase,
      logHabitUseCase,
      refresh,
      scheduleHabitNotificationsUseCase,
      t,
    ],
  );

  return {
    habits: dashboard,
    isLoading,
    ...actions,
  };
}
