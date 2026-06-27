import {
  ExportUserDataUseCase,
  RequestReviewAfterRescueUseCase,
  ResetUserDataUseCase,
} from '@/application/use-cases/settings.use-case';
import type { AppMetaRepository } from '@/application/ports/app-meta-repository.port';
import type { ReviewPort } from '@/application/ports/review.port';
import type { UserDataPort, UserDataSnapshot } from '@/application/ports/user-data.port';

const snapshot: UserDataSnapshot = {
  exportedAt: '2026-06-26T00:00:00.000Z',
  settings: [{ id: 'default', selectedApproach: 'universal' }],
  profile: null,
  habits: [{ id: 'habit-1', title: 'Walk' }],
  habitLogs: [],
  bookmarks: [],
  chatMessages: [],
  aiUsage: [],
};

class InMemoryUserDataPort implements UserDataPort {
  resetCalled = false;

  async exportSnapshot(): Promise<UserDataSnapshot> {
    return snapshot;
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
  it('clears local user data', async () => {
    const port = new InMemoryUserDataPort();
    const useCase = new ResetUserDataUseCase(port);

    await useCase.execute();
    expect(port.resetCalled).toBe(true);
  });
});

describe('RequestReviewAfterRescueUseCase', () => {
  it('requests review only once', async () => {
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
    await expect(useCase.execute()).resolves.toBe('requested');
    await expect(useCase.execute()).resolves.toBe('skipped');
    expect(reviewPort.requestReview).toHaveBeenCalledTimes(1);
  });
});
