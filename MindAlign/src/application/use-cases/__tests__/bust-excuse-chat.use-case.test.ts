import { BustExcuseChatUseCase } from '@/application/use-cases/bust-excuse-chat.use-case';
import type { AiCoachPort } from '@/application/ports/ai-coach.port';
import type { AiUsageRepository } from '@/application/ports/ai-usage-repository.port';

describe('BustExcuseChatUseCase', () => {
  const coachResponse = {
    barrier_label: 'Erteleme',
    reflection: 'Erteleme bir koruma mekanizması olabilir.',
    micro_task: '1 dakika başla.',
    encouragement: 'Devam edebilirsin.',
  };

  let aiCoach: AiCoachPort;
  let aiUsageRepository: AiUsageRepository;
  let useCase: BustExcuseChatUseCase;

  let mockGenerateCoachResponse: jest.Mock;
  let mockGetUsageForWeek: jest.Mock;
  let mockIncrementForWeek: jest.Mock;
  let mockGetEntitlement: jest.Mock;

  beforeEach(() => {
    mockGenerateCoachResponse = jest.fn(async () => coachResponse);
    mockGetUsageForWeek = jest.fn(async () => ({ count: 0, bonusCount: 0 }));
    mockIncrementForWeek = jest.fn(async () => 1);
    mockGetEntitlement = jest.fn(async () => ({ isPremium: false }));

    aiCoach = { generateCoachResponse: mockGenerateCoachResponse };
    aiUsageRepository = {
      getUsageForWeek: mockGetUsageForWeek,
      incrementForWeek: mockIncrementForWeek,
      addBonusForWeek: jest.fn(async () => 1),
    };
    const subscriptionPort = {
      configure: jest.fn(async () => undefined),
      getOfferings: jest.fn(async () => null),
      purchase: jest.fn(async () => ({ isPremium: true })),
      restorePurchases: jest.fn(async () => ({ isPremium: false })),
      getEntitlement: mockGetEntitlement,
      identifyUser: jest.fn(async () => undefined),
      onEntitlementChanged: jest.fn(() => () => undefined),
    };
    const remoteConfigPort = {
      configure: jest.fn(async () => undefined),
      fetchAndActivate: jest.fn(async () => undefined),
      getValues: jest.fn(async () => ({
        freeWeeklyQuota: 3,
        premiumWeeklyQuota: 60,
        geminiModel: 'gemini-2.5-flash',
        geminiLiteModel: 'gemini-2.5-flash-lite',
      })),
    };
    useCase = new BustExcuseChatUseCase(
      aiCoach,
      aiUsageRepository,
      subscriptionPort,
      remoteConfigPort,
    );
  });

  it('returns coach response for on-topic excuse', async () => {
    const result = await useCase.execute({
      habitTitle: 'Meditasyon',
      excuse: 'Bugün çok yorgunum',
      approach: 'universal',
    });

    expect(result.kind).toBe('coach');
    if (result.kind === 'coach') {
      expect(result.response.micro_task).toBe('1 dakika başla.');
    }
    expect(mockIncrementForWeek).toHaveBeenCalled();
  });

  it('blocks off-topic requests without calling AI', async () => {
    const result = await useCase.execute({
      habitTitle: 'Meditasyon',
      excuse: 'bana python kodu yaz',
      approach: 'universal',
    });

    expect(result.kind).toBe('off_topic');
    expect(mockGenerateCoachResponse).not.toHaveBeenCalled();
  });

  it('returns crisis support before quota check', async () => {
    mockGetUsageForWeek.mockResolvedValue({ count: 99, bonusCount: 0 });

    const result = await useCase.execute({
      habitTitle: 'Meditasyon',
      excuse: 'intihar etmek istiyorum',
      approach: 'universal',
    });

    expect(result.kind).toBe('crisis');
    expect(mockGenerateCoachResponse).not.toHaveBeenCalled();
    expect(mockGetEntitlement).not.toHaveBeenCalled();
  });

  it('returns quota exceeded when weekly limit reached', async () => {
    mockGetUsageForWeek.mockResolvedValue({ count: 3, bonusCount: 0 });

    const result = await useCase.execute({
      habitTitle: 'Meditasyon',
      excuse: 'Yorgunum',
      approach: 'universal',
    });

    expect(result.kind).toBe('quota_exceeded');
    expect(mockGenerateCoachResponse).not.toHaveBeenCalled();
  });
});
