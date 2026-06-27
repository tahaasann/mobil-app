import { createContext, useContext, useMemo, type ReactNode } from 'react';

import type { AiCoachPort } from '@/application/ports/ai-coach.port';
import { BustExcuseChatUseCase } from '@/application/use-cases/bust-excuse-chat.use-case';
import { CreateHabitUseCase } from '@/application/use-cases/create-habit.use-case';
import { GetDashboardUseCase } from '@/application/use-cases/get-dashboard.use-case';
import { LogHabitUseCase } from '@/application/use-cases/log-habit.use-case';
import {
  FailStreakUseCase,
  RescueStreakUseCase,
} from '@/application/use-cases/rescue-streak.use-case';
import { useAppDatabase } from '@/infrastructure/database/database-provider';
import { DrizzleAiUsageRepository } from '@/infrastructure/database/repositories/drizzle-ai-usage.repository';
import { DrizzleHabitLogRepository } from '@/infrastructure/database/repositories/drizzle-habit-log.repository';
import { DrizzleHabitRepository } from '@/infrastructure/database/repositories/drizzle-habit.repository';
import { FirebaseAiCoachAdapter } from '@/infrastructure/firebase/firebase-ai-coach.adapter';
import { MockAiCoachAdapter } from '@/infrastructure/firebase/mock-ai-coach.adapter';

export type AppContainer = {
  createHabitUseCase: CreateHabitUseCase;
  logHabitUseCase: LogHabitUseCase;
  getDashboardUseCase: GetDashboardUseCase;
  bustExcuseChatUseCase: BustExcuseChatUseCase;
  rescueStreakUseCase: RescueStreakUseCase;
  failStreakUseCase: FailStreakUseCase;
};

const AppContainerContext = createContext<AppContainer | null>(null);

function createAiCoach(): AiCoachPort {
  if (process.env.EXPO_PUBLIC_AI_MOCK === 'true') {
    return new MockAiCoachAdapter();
  }
  return new FirebaseAiCoachAdapter();
}

export function AppContainerProvider({ children }: { children: ReactNode }) {
  const db = useAppDatabase();
  const container = useMemo<AppContainer>(() => {
    const habitRepository = new DrizzleHabitRepository(db);
    const habitLogRepository = new DrizzleHabitLogRepository(db);
    const aiUsageRepository = new DrizzleAiUsageRepository(db);
    const aiCoach = createAiCoach();

    return {
      createHabitUseCase: new CreateHabitUseCase(habitRepository),
      logHabitUseCase: new LogHabitUseCase(habitLogRepository),
      getDashboardUseCase: new GetDashboardUseCase(habitRepository, habitLogRepository),
      bustExcuseChatUseCase: new BustExcuseChatUseCase(aiCoach, aiUsageRepository),
      rescueStreakUseCase: new RescueStreakUseCase(habitLogRepository),
      failStreakUseCase: new FailStreakUseCase(habitLogRepository),
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
