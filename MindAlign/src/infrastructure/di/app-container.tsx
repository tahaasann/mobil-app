import { createContext, useContext, useMemo, type ReactNode } from 'react';

import type { AiCoachPort } from '@/application/ports/ai-coach.port';
import { BustExcuseChatUseCase } from '@/application/use-cases/bust-excuse-chat.use-case';
import { CreateHabitUseCase } from '@/application/use-cases/create-habit.use-case';
import { GetAppSettingsUseCase } from '@/application/use-cases/get-app-settings.use-case';
import { GetDashboardUseCase } from '@/application/use-cases/get-dashboard.use-case';
import { GetUserProfileUseCase } from '@/application/use-cases/get-user-profile.use-case';
import { LogHabitUseCase } from '@/application/use-cases/log-habit.use-case';
import { SaveOnboardingUseCase } from '@/application/use-cases/save-onboarding.use-case';
import {
  FailStreakUseCase,
  RescueStreakUseCase,
} from '@/application/use-cases/rescue-streak.use-case';
import { useAppDatabase } from '@/infrastructure/database/database-provider';
import { DrizzleAiUsageRepository } from '@/infrastructure/database/repositories/drizzle-ai-usage.repository';
import { DrizzleAppSettingsRepository } from '@/infrastructure/database/repositories/drizzle-app-settings.repository';
import { DrizzleHabitLogRepository } from '@/infrastructure/database/repositories/drizzle-habit-log.repository';
import { DrizzleHabitRepository } from '@/infrastructure/database/repositories/drizzle-habit.repository';
import { DrizzleUserProfileRepository } from '@/infrastructure/database/repositories/drizzle-user-profile.repository';
import { FirebaseAiCoachAdapter } from '@/infrastructure/firebase/firebase-ai-coach.adapter';
import { MockAiCoachAdapter } from '@/infrastructure/firebase/mock-ai-coach.adapter';

export type AppContainer = {
  createHabitUseCase: CreateHabitUseCase;
  logHabitUseCase: LogHabitUseCase;
  getDashboardUseCase: GetDashboardUseCase;
  bustExcuseChatUseCase: BustExcuseChatUseCase;
  rescueStreakUseCase: RescueStreakUseCase;
  failStreakUseCase: FailStreakUseCase;
  saveOnboardingUseCase: SaveOnboardingUseCase;
  getAppSettingsUseCase: GetAppSettingsUseCase;
  getUserProfileUseCase: GetUserProfileUseCase;
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
    const appSettingsRepository = new DrizzleAppSettingsRepository(db);
    const userProfileRepository = new DrizzleUserProfileRepository(db);
    const aiCoach = createAiCoach();
    const createHabitUseCase = new CreateHabitUseCase(habitRepository);

    return {
      createHabitUseCase,
      logHabitUseCase: new LogHabitUseCase(habitLogRepository),
      getDashboardUseCase: new GetDashboardUseCase(habitRepository, habitLogRepository),
      bustExcuseChatUseCase: new BustExcuseChatUseCase(aiCoach, aiUsageRepository),
      rescueStreakUseCase: new RescueStreakUseCase(habitLogRepository),
      failStreakUseCase: new FailStreakUseCase(habitLogRepository),
      saveOnboardingUseCase: new SaveOnboardingUseCase(
        appSettingsRepository,
        userProfileRepository,
        createHabitUseCase,
      ),
      getAppSettingsUseCase: new GetAppSettingsUseCase(appSettingsRepository),
      getUserProfileUseCase: new GetUserProfileUseCase(userProfileRepository),
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
