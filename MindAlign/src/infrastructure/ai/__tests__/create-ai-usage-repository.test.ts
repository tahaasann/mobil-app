import { createAiUsageRepository } from '@/infrastructure/ai/create-ai-usage-repository';
import { ServerBackedAiUsageRepository } from '@/infrastructure/ai/server-backed-ai-usage.repository';
import { DrizzleAiUsageRepository } from '@/infrastructure/database/repositories/drizzle-ai-usage.repository';

describe('createAiUsageRepository', () => {
  const db = {} as never;
  const subscriptionPort = {
    getEntitlement: jest.fn(async () => ({ isPremium: false })),
  } as never;
  const remoteConfigPort = {
    getValues: jest.fn(async () => ({
      freeWeeklyQuota: 3,
      premiumWeeklyQuota: 60,
      geminiModel: 'gemini-2.5-flash',
      geminiLiteModel: 'gemini-2.5-flash-lite',
      aiEnabled: true,
      serverAiQuotaEnabled: false,
    })),
  } as never;

  afterEach(() => {
    delete process.env.EXPO_PUBLIC_SERVER_AI_QUOTA;
  });

  it('uses local drizzle repository by default', () => {
    const repository = createAiUsageRepository({ db, subscriptionPort, remoteConfigPort });
    expect(repository).toBeInstanceOf(DrizzleAiUsageRepository);
  });

  it('uses server-backed repository when server quota flag is enabled', () => {
    process.env.EXPO_PUBLIC_SERVER_AI_QUOTA = 'true';
    process.env.EXPO_PUBLIC_AI_QUOTA_BASE_URL = 'https://quota.example.com';

    const repository = createAiUsageRepository({ db, subscriptionPort, remoteConfigPort });
    expect(repository).toBeInstanceOf(ServerBackedAiUsageRepository);
  });
});
