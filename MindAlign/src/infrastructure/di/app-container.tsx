import { createContext, useContext, useMemo, type ReactNode } from 'react';

import type { AiCoachPort } from '@/application/ports/ai-coach.port';
import type { NotificationPort } from '@/application/ports/notification.port';
import type { SyncPort } from '@/application/ports/sync.port';
import { BookmarkUseCase } from '@/application/use-cases/bookmark.use-case';
import { BustExcuseChatUseCase } from '@/application/use-cases/bust-excuse-chat.use-case';
import {
  ClearChatThreadUseCase,
  ListChatMessagesUseCase,
  SaveChatMessageUseCase,
} from '@/application/use-cases/chat-message.use-case';
import { CreateHabitUseCase } from '@/application/use-cases/create-habit.use-case';
import { GetAppSettingsUseCase } from '@/application/use-cases/get-app-settings.use-case';
import { GetDashboardUseCase } from '@/application/use-cases/get-dashboard.use-case';
import {
  GetHabitDetailUseCase,
} from '@/application/use-cases/get-habit-detail.use-case';
import { UpdateHabitUseCase } from '@/application/use-cases/update-habit.use-case';
import { ArchiveHabitUseCase } from '@/application/use-cases/archive-habit.use-case';
import {
  AddHabitNoteUseCase,
  DeleteHabitNoteUseCase,
  ListHabitNotesUseCase,
} from '@/application/use-cases/habit-note.use-case';
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
import { GrantRewardedAdBonusUseCase } from '@/application/use-cases/subscription.use-case';
import {
  ExportUserDataUseCase,
  RequestReviewAfterRescueUseCase,
  ResetUserDataUseCase,
  ReplayOnboardingUseCase,
  UpdateAppSettingsUseCase,
  UpdateUserProfileUseCase,
} from '@/application/use-cases/settings.use-case';
import { SyncOnLoginUseCase } from '@/application/use-cases/sync-on-login.use-case';
import {
  EnqueueSyncUseCase,
  FlushSyncOutboxUseCase,
} from '@/application/use-cases/sync-outbox.use-case';
import { ReportAiResponseUseCase } from '@/application/use-cases/report-ai-response.use-case';
import {
  HandleAuthSessionUseCase,
  SignOutSessionUseCase,
} from '@/application/use-cases/auth-session.use-case';
import { usePlatformPorts } from '@/infrastructure/di/platform-container';
import { useSubscriptionPorts } from '@/infrastructure/di/subscription-container';
import { DrizzleAppMetaRepository } from '@/infrastructure/database/repositories/drizzle-app-meta.repository';
import { useAppDatabase } from '@/infrastructure/database/database-provider';
import { createAiUsageRepository } from '@/infrastructure/ai/create-ai-usage-repository';
import { DrizzleAppSettingsRepository } from '@/infrastructure/database/repositories/drizzle-app-settings.repository';
import { DrizzleBookmarkRepository } from '@/infrastructure/database/repositories/drizzle-bookmark.repository';
import { DrizzleChatMessageRepository } from '@/infrastructure/database/repositories/drizzle-chat-message.repository';
import { DrizzleHabitLogRepository } from '@/infrastructure/database/repositories/drizzle-habit-log.repository';
import { DrizzleHabitNoteRepository } from '@/infrastructure/database/repositories/drizzle-habit-note.repository';
import { DrizzleHabitRepository } from '@/infrastructure/database/repositories/drizzle-habit.repository';
import { DrizzleUserProfileRepository } from '@/infrastructure/database/repositories/drizzle-user-profile.repository';
import { DrizzleUserDataRepository } from '@/infrastructure/database/repositories/drizzle-user-data.repository';
import { DrizzleSyncOutboxRepository } from '@/infrastructure/database/repositories/drizzle-sync-outbox.repository';
import { createAuthPort } from '@/infrastructure/firebase/create-auth-port';
import { FirebaseAiCoachAdapter } from '@/infrastructure/firebase/firebase-ai-coach.adapter';
import { FirestoreSyncAdapter } from '@/infrastructure/firebase/firestore-sync.adapter';
import { InMemorySyncAdapter } from '@/infrastructure/firebase/in-memory-sync.adapter';
import { MockAiCoachAdapter } from '@/infrastructure/firebase/mock-ai-coach.adapter';
import { FirestoreAiReportAdapter } from '@/infrastructure/firebase/firestore-ai-report.adapter';
import { MockAiReportAdapter } from '@/infrastructure/firebase/mock-ai-report.adapter';
import { ExpoNotificationAdapter } from '@/infrastructure/notifications/expo-notification.adapter';
import { MockNotificationAdapter } from '@/infrastructure/notifications/mock-notification.adapter';
import { ExpoStoreReviewAdapter } from '@/infrastructure/reviews/expo-store-review.adapter';
import { MockReviewAdapter } from '@/infrastructure/reviews/mock-review.adapter';

export type AppContainer = {
  createHabitUseCase: CreateHabitUseCase;
  logHabitUseCase: LogHabitUseCase;
  getDashboardUseCase: GetDashboardUseCase;
  getHabitDetailUseCase: GetHabitDetailUseCase;
  updateHabitUseCase: UpdateHabitUseCase;
  archiveHabitUseCase: ArchiveHabitUseCase;
  addHabitNoteUseCase: AddHabitNoteUseCase;
  deleteHabitNoteUseCase: DeleteHabitNoteUseCase;
  listHabitNotesUseCase: ListHabitNotesUseCase;
  bustExcuseChatUseCase: BustExcuseChatUseCase;
  rescueStreakUseCase: RescueStreakUseCase;
  failStreakUseCase: FailStreakUseCase;
  saveOnboardingUseCase: SaveOnboardingUseCase;
  getAppSettingsUseCase: GetAppSettingsUseCase;
  getUserProfileUseCase: GetUserProfileUseCase;
  bookmarkUseCase: BookmarkUseCase;
  saveChatMessageUseCase: SaveChatMessageUseCase;
  listChatMessagesUseCase: ListChatMessagesUseCase;
  clearChatThreadUseCase: ClearChatThreadUseCase;
  syncOnLoginUseCase: SyncOnLoginUseCase;
  handleAuthSessionUseCase: HandleAuthSessionUseCase;
  signOutSessionUseCase: SignOutSessionUseCase;
  scheduleHabitNotificationsUseCase: ScheduleHabitNotificationsUseCase;
  rescheduleAllNotificationsUseCase: RescheduleAllNotificationsUseCase;
  requestNotificationPermissionUseCase: RequestNotificationPermissionUseCase;
  grantRewardedAdBonusUseCase: GrantRewardedAdBonusUseCase;
  exportUserDataUseCase: ExportUserDataUseCase;
  resetUserDataUseCase: ResetUserDataUseCase;
  replayOnboardingUseCase: ReplayOnboardingUseCase;
  updateAppSettingsUseCase: UpdateAppSettingsUseCase;
  updateUserProfileUseCase: UpdateUserProfileUseCase;
  requestReviewAfterRescueUseCase: RequestReviewAfterRescueUseCase;
  reportAiResponseUseCase: ReportAiResponseUseCase;
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


function createAiReportPort() {
  if (
    process.env.EXPO_PUBLIC_AUTH_MOCK === 'true' ||
    process.env.EXPO_PUBLIC_SYNC_MOCK === 'true'
  ) {
    return new MockAiReportAdapter();
  }
  return new FirestoreAiReportAdapter();
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
  const { remoteConfigPort, analyticsPort } = usePlatformPorts();
  const container = useMemo<AppContainer>(() => {
    const habitRepository = new DrizzleHabitRepository(db);
    const habitLogRepository = new DrizzleHabitLogRepository(db);
    const habitNoteRepository = new DrizzleHabitNoteRepository(db);
    const aiUsageRepository = createAiUsageRepository({
      db,
      subscriptionPort,
      remoteConfigPort,
    });
    const appSettingsRepository = new DrizzleAppSettingsRepository(db);
    const userProfileRepository = new DrizzleUserProfileRepository(db);
    const bookmarkRepository = new DrizzleBookmarkRepository(db);
    const chatMessageRepository = new DrizzleChatMessageRepository(db);
    const appMetaRepository = new DrizzleAppMetaRepository(db);
    const userDataRepository = new DrizzleUserDataRepository(db);
    const syncOutboxRepository = new DrizzleSyncOutboxRepository(
      (key) => appMetaRepository.get(key),
      (key, value) => appMetaRepository.set(key, value),
    );
    const reviewPort = createReviewPort();
    const syncPort = createSyncPort();
    const authPort = createAuthPort();
    const aiReportPort = createAiReportPort();
    const notificationPort = createNotificationPort();
    const aiCoach = createAiCoach();
    const enqueueSyncUseCase = new EnqueueSyncUseCase(syncOutboxRepository, appMetaRepository);
    const flushSyncOutboxUseCase = new FlushSyncOutboxUseCase(syncOutboxRepository, syncPort);
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
      getHabitDetailUseCase: new GetHabitDetailUseCase(
        habitRepository,
        habitLogRepository,
        habitNoteRepository,
      ),
      updateHabitUseCase: new UpdateHabitUseCase(habitRepository),
      archiveHabitUseCase: new ArchiveHabitUseCase(habitRepository, notificationPort),
      addHabitNoteUseCase: new AddHabitNoteUseCase(habitRepository, habitNoteRepository),
      deleteHabitNoteUseCase: new DeleteHabitNoteUseCase(habitNoteRepository),
      listHabitNotesUseCase: new ListHabitNotesUseCase(habitNoteRepository),
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
      bookmarkUseCase: new BookmarkUseCase(bookmarkRepository, enqueueSyncUseCase),
      saveChatMessageUseCase: new SaveChatMessageUseCase(chatMessageRepository, enqueueSyncUseCase),
      listChatMessagesUseCase: new ListChatMessagesUseCase(chatMessageRepository),
      clearChatThreadUseCase: new ClearChatThreadUseCase(chatMessageRepository),
      syncOnLoginUseCase,
      handleAuthSessionUseCase: new HandleAuthSessionUseCase(
        appMetaRepository,
        userDataRepository,
        notificationPort,
        syncOnLoginUseCase,
        subscriptionPort,
      ),
      signOutSessionUseCase: new SignOutSessionUseCase(
        notificationPort,
        subscriptionPort,
        appMetaRepository,
        flushSyncOutboxUseCase,
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
      grantRewardedAdBonusUseCase: new GrantRewardedAdBonusUseCase(
        adsPort,
        aiUsageRepository,
        subscriptionPort,
      ),
      exportUserDataUseCase: new ExportUserDataUseCase(userDataRepository),
      resetUserDataUseCase: new ResetUserDataUseCase(
        userDataRepository,
        notificationPort,
        syncPort,
        syncOutboxRepository,
        appMetaRepository,
        authPort,
      ),
      replayOnboardingUseCase: new ReplayOnboardingUseCase(appSettingsRepository),
      updateAppSettingsUseCase: new UpdateAppSettingsUseCase(appSettingsRepository),
      updateUserProfileUseCase: new UpdateUserProfileUseCase(userProfileRepository),
      requestReviewAfterRescueUseCase: new RequestReviewAfterRescueUseCase(
        reviewPort,
        appMetaRepository,
      ),
      reportAiResponseUseCase: new ReportAiResponseUseCase(aiReportPort, analyticsPort),
    };
  }, [db, subscriptionPort, adsPort, remoteConfigPort, analyticsPort]);

  return <AppContainerContext.Provider value={container}>{children}</AppContainerContext.Provider>;
}

export function useAppContainer(): AppContainer {
  const container = useContext(AppContainerContext);
  if (!container) {
    throw new Error('useAppContainer must be used within AppContainerProvider');
  }
  return container;
}
