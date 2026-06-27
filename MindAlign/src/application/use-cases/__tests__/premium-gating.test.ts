import {
  FREE_WEEKLY_AI_QUOTA,
  PREMIUM_WEEKLY_AI_QUOTA,
  resolveWeeklyQuotaLimit,
} from '@/domain/ai/ai-quota';
import { BustExcuseChatUseCase } from '@/application/use-cases/bust-excuse-chat.use-case';
import type { AiCoachPort } from '@/application/ports/ai-coach.port';
import type { AiUsageRepository } from '@/application/ports/ai-usage-repository.port';
import type { SubscriptionPort } from '@/application/ports/subscription.port';

describe('premium gating in BustExcuseChatUseCase', () => {
  const coachResponse = {
    barrier_label: 'Erteleme',
    reflection: 'Erteleme bir koruma mekanizması olabilir.',
    micro_task: '1 dakika başla.',
    encouragement: 'Devam edebilirsin.',
  };

  let aiCoach: AiCoachPort;
  let aiUsageRepository: AiUsageRepository;
  let subscriptionPort: SubscriptionPort;
  let useCase: BustExcuseChatUseCase;

  beforeEach(() => {
    aiCoach = { generateCoachResponse: jest.fn(async () => coachResponse) };
    aiUsageRepository = {
      getUsageForWeek: jest.fn(async () => ({ count: 0, bonusCount: 0 })),
      incrementForWeek: jest.fn(async () => 1),
      addBonusForWeek: jest.fn(async () => 1),
    };
    subscriptionPort = {
      configure: jest.fn(async () => undefined),
      getOfferings: jest.fn(async () => null),
      purchase: jest.fn(async () => ({ isPremium: true })),
      restorePurchases: jest.fn(async () => ({ isPremium: false })),
      getEntitlement: jest.fn(async () => ({ isPremium: false })),
      onEntitlementChanged: jest.fn(() => () => undefined),
    };
    const remoteConfigPort = {
      configure: jest.fn(async () => undefined),
      fetchAndActivate: jest.fn(async () => undefined),
      getValues: jest.fn(async () => ({
        freeWeeklyQuota: 3,
        premiumWeeklyQuota: 60,
        geminiModel: 'gemini-2.0-flash',
      })),
    };
    useCase = new BustExcuseChatUseCase(
      aiCoach,
      aiUsageRepository,
      subscriptionPort,
      remoteConfigPort,
    );
  });

  it('allows premium users beyond free weekly limit', async () => {
    (subscriptionPort.getEntitlement as jest.Mock).mockResolvedValue({ isPremium: true });
    (aiUsageRepository.getUsageForWeek as jest.Mock).mockResolvedValue({
      count: FREE_WEEKLY_AI_QUOTA,
      bonusCount: 0,
    });

    const result = await useCase.execute({
      habitTitle: 'Meditasyon',
      excuse: 'Yorgunum',
      approach: 'universal',
    });

    expect(result.kind).toBe('coach');
  });

  it('blocks free users at weekly limit without bonus', async () => {
    (aiUsageRepository.getUsageForWeek as jest.Mock).mockResolvedValue({
      count: FREE_WEEKLY_AI_QUOTA,
      bonusCount: 0,
    });

    const result = await useCase.execute({
      habitTitle: 'Meditasyon',
      excuse: 'Yorgunum',
      approach: 'universal',
    });

    expect(result.kind).toBe('quota_exceeded');
  });

  it('allows free users with rewarded bonus quota', async () => {
    (aiUsageRepository.getUsageForWeek as jest.Mock).mockResolvedValue({
      count: FREE_WEEKLY_AI_QUOTA,
      bonusCount: 1,
    });

    const result = await useCase.execute({
      habitTitle: 'Meditasyon',
      excuse: 'Yorgunum',
      approach: 'universal',
    });

    expect(result.kind).toBe('coach');
    expect(resolveWeeklyQuotaLimit({ isPremium: false, bonusCount: 1 })).toBe(4);
  });

  it('blocks premium users at fair-use cap', async () => {
    (subscriptionPort.getEntitlement as jest.Mock).mockResolvedValue({ isPremium: true });
    (aiUsageRepository.getUsageForWeek as jest.Mock).mockResolvedValue({
      count: PREMIUM_WEEKLY_AI_QUOTA,
      bonusCount: 0,
    });

    const result = await useCase.execute({
      habitTitle: 'Meditasyon',
      excuse: 'Yorgunum',
      approach: 'universal',
    });

    expect(result.kind).toBe('quota_exceeded');
  });
});
