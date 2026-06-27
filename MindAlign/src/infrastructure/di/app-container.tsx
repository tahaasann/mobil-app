import { createContext, useContext, useMemo, type ReactNode } from 'react';

import { CreateHabitUseCase } from '@/application/use-cases/create-habit.use-case';
import { GetDashboardUseCase } from '@/application/use-cases/get-dashboard.use-case';
import { LogHabitUseCase } from '@/application/use-cases/log-habit.use-case';
import { useAppDatabase } from '@/infrastructure/database/database-provider';
import { DrizzleHabitLogRepository } from '@/infrastructure/database/repositories/drizzle-habit-log.repository';
import { DrizzleHabitRepository } from '@/infrastructure/database/repositories/drizzle-habit.repository';

export type AppContainer = {
  createHabitUseCase: CreateHabitUseCase;
  logHabitUseCase: LogHabitUseCase;
  getDashboardUseCase: GetDashboardUseCase;
};

const AppContainerContext = createContext<AppContainer | null>(null);

export function AppContainerProvider({ children }: { children: ReactNode }) {
  const db = useAppDatabase();
  const container = useMemo<AppContainer>(() => {
    const habitRepository = new DrizzleHabitRepository(db);
    const habitLogRepository = new DrizzleHabitLogRepository(db);

    return {
      createHabitUseCase: new CreateHabitUseCase(habitRepository),
      logHabitUseCase: new LogHabitUseCase(habitLogRepository),
      getDashboardUseCase: new GetDashboardUseCase(habitRepository, habitLogRepository),
    };
  }, [db]);

  return <AppContainerContext.Provider value={container}>{children}</AppContainerContext.Provider>;
}

export function useAppContainer(): AppContainer {
  const container = useContext(AppContainerContext);
  if (!container) {
    throw new Error('useAppContainer must be used within AppContainerProvider');
  }
  return container;
}
