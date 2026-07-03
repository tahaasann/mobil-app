import {
  ExportUserDataUseCase,
  ReplayOnboardingUseCase,
  RequestReviewAfterRescueUseCase,
  ResetUserDataUseCase,
} from '@/application/use-cases/settings.use-case';
import type { AppMetaRepository } from '@/application/ports/app-meta-repository.port';
import type { AppSettingsRepository } from '@/application/ports/app-settings-repository.port';
import type { ReviewPort } from '@/application/ports/review.port';
import type { UserDataPort, UserDataSnapshot } from '@/application/ports/user-data.port';
import { createDefaultAppSettings } from '@/domain/entities/app-settings';

const snapshot: UserDataSnapshot = {
  exportedAt: '2026-06-26T00:00:00.000Z',
  settings: [{ id: 'default', selectedApproach: 'universal' }],
  profile: null,
  habits: [{ id: 'habit-1', title: 'Walk' }],
  habitLogs: [],
  habitNotes: [],
  bookmarks: [],
  chatMessages: [],
  aiUsage: [],
};

class InMemoryUserDataPort implements UserDataPort {
  resetCalled = false;

  async exportSnapshot(): Promise<UserDataSnapshot> {
    return snapshot;
  }

  async clearSessionData(): Promise<void> {
    this.resetCalled = true;
  }

  async resetAll(): Promise<void> {
    this.resetCalled = true;
  }
}

describe('ExportUserDataUseCase', () => {
  it('returns valid JSON export', async () => {
    const useCase = new ExportUserDataUseCase(new InMemoryUserDataPort());
    const json = await useCase.execute();
    const parsed = JSON.parse(json);

    expect(parsed.habits).toHaveLength(1);
    expect(parsed.exportedAt).toBe('2026-06-26T00:00:00.000Z');
  });
});

describe('ResetUserDataUseCase', () => {
  it('clears local user data and cancels notifications for guest users', async () => {
    const port = new InMemoryUserDataPort();
    const notificationPort = {
      requestPermissions: jest.fn(),
      schedule: jest.fn(),
      cancel: jest.fn(),
      cancelAllForHabit: jest.fn(),
      cancelAll: jest.fn(async () => undefined),
    };
    const syncPort = { deleteAllUserData: jest.fn(async () => undefined) };
    const syncOutboxRepository = { clear: jest.fn(async () => undefined) };
    const appMetaRepository = {
      get: jest.fn(async () => null),
      set: jest.fn(async () => undefined),
      delete: jest.fn(async () => undefined),
    };
    const authPort = { deleteAccount: jest.fn(async () => undefined) };
    const useCase = new ResetUserDataUseCase(
      port,
      notificationPort as never,
      syncPort as never,
      syncOutboxRepository as never,
      appMetaRepository as never,
      authPort as never,
    );

    await useCase.execute({
      id: 'guest-1',
      email: null,
      isAnonymous: true,
      displayName: null,
    });
    expect(port.resetCalled).toBe(true);
    expect(notificationPort.cancelAll).toHaveBeenCalled();
    expect(syncPort.deleteAllUserData).not.toHaveBeenCalled();
    expect(authPort.deleteAccount).not.toHaveBeenCalled();
  });

  it('deletes remote data and auth account for registered users', async () => {
    const port = new InMemoryUserDataPort();
    const notificationPort = { cancelAll: jest.fn(async () => undefined) };
    const syncPort = { deleteAllUserData: jest.fn(async () => undefined) };
    const syncOutboxRepository = { clear: jest.fn(async () => undefined) };
    const appMetaRepository = {
      get: jest.fn(async () => null),
      set: jest.fn(async () => undefined),
      delete: jest.fn(async () => undefined),
    };
    const authPort = { deleteAccount: jest.fn(async () => undefined) };
    const useCase = new ResetUserDataUseCase(
      port,
      notificationPort as never,
      syncPort as never,
      syncOutboxRepository as never,
      appMetaRepository as never,
      authPort as never,
    );

    await useCase.execute({
      id: 'user-1',
      email: 'coach@example.com',
      isAnonymous: false,
      displayName: null,
    });

    expect(syncPort.deleteAllUserData).toHaveBeenCalledWith('user-1');
    expect(syncOutboxRepository.clear).toHaveBeenCalledWith('user-1');
    expect(authPort.deleteAccount).toHaveBeenCalled();
    expect(port.resetCalled).toBe(true);
  });
});

describe('ReplayOnboardingUseCase', () => {
  it('marks onboarding as incomplete while preserving other settings', async () => {
    const defaults = createDefaultAppSettings();
    let saved = { ...defaults, onboardingCompleted: true };

    const settingsRepository: AppSettingsRepository = {
      get: async () => saved,
      save: async (next) => {
        saved = next;
      },
    };

    const useCase = new ReplayOnboardingUseCase(settingsRepository);
    await useCase.execute();

    expect(saved.onboardingCompleted).toBe(false);
    expect(saved.selectedApproach).toBe(defaults.selectedApproach);
    expect(saved.language).toBe(defaults.language);
    expect(saved.theme).toBe(defaults.theme);
  });

  it('throws when settings are missing', async () => {
    const settingsRepository: AppSettingsRepository = {
      get: async () => null,
      save: async () => undefined,
    };

    const useCase = new ReplayOnboardingUseCase(settingsRepository);
    await expect(useCase.execute()).rejects.toThrow('settings_not_found');
  });
});

describe('RequestReviewAfterRescueUseCase', () => {
  it('requests review only after the rescue threshold', async () => {
    const meta = new Map<string, string>();
    const appMetaRepository: AppMetaRepository = {
      get: async (key) => meta.get(key) ?? null,
      set: async (key, value) => {
        meta.set(key, value);
      },
      delete: async (key) => {
        meta.delete(key);
      },
    };
    const reviewPort: ReviewPort = {
      isAvailable: async () => true,
      requestReview: jest.fn(async () => undefined),
    };

    const useCase = new RequestReviewAfterRescueUseCase(reviewPort, appMetaRepository);
    await expect(useCase.execute()).resolves.toBe('skipped');
    await expect(useCase.execute()).resolves.toBe('skipped');
    await expect(useCase.execute()).resolves.toBe('requested');
    await expect(useCase.execute()).resolves.toBe('skipped');
    expect(reviewPort.requestReview).toHaveBeenCalledTimes(1);
  });
});
