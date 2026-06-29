import { createContext, useContext, useMemo, type ReactNode } from 'react';

import type { AiCoachPort } from '@/application/ports/ai-coach.port';
import type { NotificationPort } from '@/application/ports/notification.port';
import type { SyncPort } from '@/application/ports/sync.port';
import { BookmarkUseCase } from '@/application/use-cases/bookmark.use-case';
import { BustExcuseChatUseCase } from '@/application/use-cases/bust-excuse-chat.use-case';
import {
  ListChatMessagesUseCase,
  SaveChatMessageUseCase,
} from '@/application/use-cases/chat-message.use-case';
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
import {
  RequestNotificationPermissionUseCase,
  RescheduleAllNotificationsUseCase,
  ScheduleHabitNotificationsUseCase,
} from '@/application/use-cases/notification.use-case';
import {
  GrantRewardedAdBonusUseCase,
  PurchaseSubscriptionUseCase,
  RestorePurchasesUseCase,
} from '@/application/use-cases/subscription.use-case';
import {
  ExportUserDataUseCase,
  RequestReviewAfterRescueUseCase,
  ResetUserDataUseCase,
  UpdateAppSettingsUseCase,
  UpdateUserProfileUseCase,
} from '@/application/use-cases/settings.use-case';
import { SyncOnLoginUseCase } from '@/application/use-cases/sync-on-login.use-case';
import {
  HandleAuthSessionUseCase,
  SignOutSessionUseCase,
} from '@/application/use-cases/auth-session.use-case';
import { usePlatformPorts } from '@/infrastructure/di/platform-container';
import { useSubscriptionPorts } from '@/infrastructure/di/subscription-container';
import { DrizzleAppMetaRepository } from '@/infrastructure/database/repositories/drizzle-app-meta.repository';
import { useAppDatabase } from '@/infrastructure/database/database-provider';
import { DrizzleAiUsageRepository } from '@/infrastructure/database/repositories/drizzle-ai-usage.repository';
import { DrizzleAppSettingsRepository } from '@/infrastructure/database/repositories/drizzle-app-settings.repository';
import { DrizzleBookmarkRepository } from '@/infrastructure/database/repositories/drizzle-bookmark.repository';
import { DrizzleChatMessageRepository } from '@/infrastructure/database/repositories/drizzle-chat-message.repository';
import { DrizzleHabitLogRepository } from '@/infrastructure/database/repositories/drizzle-habit-log.repository';
import { DrizzleHabitRepository } from '@/infrastructure/database/repositories/drizzle-habit.repository';
import { DrizzleUserProfileRepository } from '@/infrastructure/database/repositories/drizzle-user-profile.repository';
import { DrizzleUserDataRepository } from '@/infrastructure/database/repositories/drizzle-user-data.repository';
import { FirebaseAiCoachAdapter } from '@/infrastructure/firebase/firebase-ai-coach.adapter';
import { FirestoreSyncAdapter } from '@/infrastructure/firebase/firestore-sync.adapter';
import { InMemorySyncAdapter } from '@/infrastructure/firebase/in-memory-sync.adapter';
import { MockAiCoachAdapter } from '@/infrastructure/firebase/mock-ai-coach.adapter';
import { ExpoNotificationAdapter } from '@/infrastructure/notifications/expo-notification.adapter';
import { MockNotificationAdapter } from '@/infrastructure/notifications/mock-notification.adapter';
import { ExpoStoreReviewAdapter } from '@/infrastructure/reviews/expo-store-review.adapter';
import { MockReviewAdapter } from '@/infrastructure/reviews/mock-review.adapter';

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
  bookmarkUseCase: BookmarkUseCase;
  saveChatMessageUseCase: SaveChatMessageUseCase;
  listChatMessagesUseCase: ListChatMessagesUseCase;
  syncOnLoginUseCase: SyncOnLoginUseCase;
  handleAuthSessionUseCase: HandleAuthSessionUseCase;
  signOutSessionUseCase: SignOutSessionUseCase;
  scheduleHabitNotificationsUseCase: ScheduleHabitNotificationsUseCase;
  rescheduleAllNotificationsUseCase: RescheduleAllNotificationsUseCase;
  requestNotificationPermissionUseCase: RequestNotificationPermissionUseCase;
  purchaseSubscriptionUseCase: PurchaseSubscriptionUseCase;
  restorePurchasesUseCase: RestorePurchasesUseCase;
  grantRewardedAdBonusUseCase: GrantRewardedAdBonusUseCase;
  exportUserDataUseCase: ExportUserDataUseCase;
  resetUserDataUseCase: ResetUserDataUseCase;
  updateAppSettingsUseCase: UpdateAppSettingsUseCase;
  updateUserProfileUseCase: UpdateUserProfileUseCase;
  requestReviewAfterRescueUseCase: RequestReviewAfterRescueUseCase;
};

const AppContainerContext = createContext<AppContainer | null>(null);

function createAiCoach(): AiCoachPort {
  if (process.env.EXPO_PUBLIC_AI_MOCK === 'true') {
    return new MockAiCoachAdapter();
  }
  return new FirebaseAiCoachAdapter();
}

function createSyncPort(): SyncPort {
  if (
    process.env.EXPO_PUBLIC_AUTH_MOCK === 'true' ||
    process.env.EXPO_PUBLIC_SYNC_MOCK === 'true'
  ) {
    return new InMemorySyncAdapter();
  }
  return new FirestoreSyncAdapter();
}

function createNotificationPort(): NotificationPort {
  if (process.env.EXPO_PUBLIC_NOTIFICATION_MOCK === 'true') {
    return new MockNotificationAdapter();
  }
  return new ExpoNotificationAdapter();
}

function createReviewPort() {
  if (process.env.EXPO_PUBLIC_REVIEW_MOCK === 'true') {
    return new MockReviewAdapter();
  }
  return new ExpoStoreReviewAdapter();
}

export function AppContainerProvider({ children }: { children: ReactNode }) {
  const db = useAppDatabase();
  const { subscriptionPort, adsPort } = useSubscriptionPorts();
  const { remoteConfigPort } = usePlatformPorts();
  const container = useMemo<AppContainer>(() => {
    const habitRepository = new DrizzleHabitRepository(db);
    const habitLogRepository = new DrizzleHabitLogRepository(db);
    const aiUsageRepository = new DrizzleAiUsageRepository(db);
    const appSettingsRepository = new DrizzleAppSettingsRepository(db);
    const userProfileRepository = new DrizzleUserProfileRepository(db);
    const bookmarkRepository = new DrizzleBookmarkRepository(db);
    const chatMessageRepository = new DrizzleChatMessageRepository(db);
    const appMetaRepository = new DrizzleAppMetaRepository(db);
    const userDataRepository = new DrizzleUserDataRepository(db);
    const reviewPort = createReviewPort();
    const syncPort = createSyncPort();
    const notificationPort = createNotificationPort();
    const aiCoach = createAiCoach();
    const createHabitUseCase = new CreateHabitUseCase(habitRepository);
    const scheduleHabitNotificationsUseCase = new ScheduleHabitNotificationsUseCase(
      notificationPort,
    );

    const syncOnLoginUseCase = new SyncOnLoginUseCase(
      syncPort,
      bookmarkRepository,
      chatMessageRepository,
    );

    return {
      createHabitUseCase,
      logHabitUseCase: new LogHabitUseCase(habitLogRepository),
      getDashboardUseCase: new GetDashboardUseCase(habitRepository, habitLogRepository),
      bustExcuseChatUseCase: new BustExcuseChatUseCase(
        aiCoach,
        aiUsageRepository,
        subscriptionPort,
        remoteConfigPort,
      ),
      rescueStreakUseCase: new RescueStreakUseCase(habitLogRepository),
      failStreakUseCase: new FailStreakUseCase(habitLogRepository),
      saveOnboardingUseCase: new SaveOnboardingUseCase(
        appSettingsRepository,
        userProfileRepository,
        createHabitUseCase,
      ),
      getAppSettingsUseCase: new GetAppSettingsUseCase(appSettingsRepository),
      getUserProfileUseCase: new GetUserProfileUseCase(userProfileRepository),
      bookmarkUseCase: new BookmarkUseCase(bookmarkRepository),
      saveChatMessageUseCase: new SaveChatMessageUseCase(chatMessageRepository),
      listChatMessagesUseCase: new ListChatMessagesUseCase(chatMessageRepository),
      syncOnLoginUseCase,
      handleAuthSessionUseCase: new HandleAuthSessionUseCase(
        appMetaRepository,
        userDataRepository,
        notificationPort,
        syncOnLoginUseCase,
        subscriptionPort,
      ),
      signOutSessionUseCase: new SignOutSessionUseCase(
        userDataRepository,
        notificationPort,
        subscriptionPort,
        appMetaRepository,
      ),
      scheduleHabitNotificationsUseCase,
      rescheduleAllNotificationsUseCase: new RescheduleAllNotificationsUseCase(
        habitRepository,
        userProfileRepository,
        scheduleHabitNotificationsUseCase,
      ),
      requestNotificationPermissionUseCase: new RequestNotificationPermissionUseCase(
        notificationPort,
      ),
      purchaseSubscriptionUseCase: new PurchaseSubscriptionUseCase(subscriptionPort),
      restorePurchasesUseCase: new RestorePurchasesUseCase(subscriptionPort),
      grantRewardedAdBonusUseCase: new GrantRewardedAdBonusUseCase(
        adsPort,
        aiUsageRepository,
        subscriptionPort,
      ),
      exportUserDataUseCase: new ExportUserDataUseCase(userDataRepository),
      resetUserDataUseCase: new ResetUserDataUseCase(userDataRepository, notificationPort),
      updateAppSettingsUseCase: new UpdateAppSettingsUseCase(appSettingsRepository),
      updateUserProfileUseCase: new UpdateUserProfileUseCase(userProfileRepository),
      requestReviewAfterRescueUseCase: new RequestReviewAfterRescueUseCase(
        reviewPort,
        appMetaRepository,
      ),
    };
  }, [db, subscriptionPort, adsPort, remoteConfigPort]);

  return <AppContainerContext.Provider value={container}>{children}</AppContainerContext.Provider>;
}

export function useAppContainer(): AppContainer {
  const container = useContext(AppContainerContext);
  if (!container) {
    throw new Error('useAppContainer must be used within AppContainerProvider');
  }
  return container;
}
