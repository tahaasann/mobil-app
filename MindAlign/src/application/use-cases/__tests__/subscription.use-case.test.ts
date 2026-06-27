import type { SubscriptionPort } from '@/application/ports/subscription.port';
import {
  GetEntitlementUseCase,
  GrantRewardedAdBonusUseCase,
  PurchaseSubscriptionUseCase,
  RestorePurchasesUseCase,
} from '@/application/use-cases/subscription.use-case';
import type { AdsPort } from '@/application/ports/ads.port';
import type { AiUsageRepository } from '@/application/ports/ai-usage-repository.port';

describe('subscription use cases', () => {
  let subscriptionPort: SubscriptionPort;
  let adsPort: AdsPort;
  let aiUsageRepository: AiUsageRepository;

  beforeEach(() => {
    subscriptionPort = {
      configure: jest.fn(async () => undefined),
      getOfferings: jest.fn(async () => null),
      purchase: jest.fn(async () => ({ isPremium: true })),
      restorePurchases: jest.fn(async () => ({ isPremium: false })),
      getEntitlement: jest.fn(async () => ({ isPremium: false })),
      onEntitlementChanged: jest.fn(() => () => undefined),
    };

    adsPort = {
      requestConsent: jest.fn(async () => undefined),
      isRewardedReady: jest.fn(async () => true),
      showRewardedAd: jest.fn(async () => 'rewarded' as const),
    };

    aiUsageRepository = {
      getUsageForWeek: jest.fn(async () => ({ count: 3, bonusCount: 0 })),
      incrementForWeek: jest.fn(async () => 4),
      addBonusForWeek: jest.fn(async () => 1),
    };
  });

  it('reads entitlement status', async () => {
    const useCase = new GetEntitlementUseCase(subscriptionPort);
    await expect(useCase.execute()).resolves.toEqual({ isPremium: false });
  });

  it('purchases a package', async () => {
    const useCase = new PurchaseSubscriptionUseCase(subscriptionPort);
    await expect(useCase.execute('mindalign_plus_monthly')).resolves.toEqual({ isPremium: true });
  });

  it('restores purchases', async () => {
    const useCase = new RestorePurchasesUseCase(subscriptionPort);
    await expect(useCase.execute()).resolves.toEqual({ isPremium: false });
  });

  it('grants bonus quota after rewarded ad', async () => {
    const useCase = new GrantRewardedAdBonusUseCase(
      adsPort,
      aiUsageRepository,
      subscriptionPort,
    );

    await expect(useCase.execute()).resolves.toBe('rewarded');
    expect(aiUsageRepository.addBonusForWeek).toHaveBeenCalled();
  });

  it('skips rewarded ad grant for premium users', async () => {
    (subscriptionPort.getEntitlement as jest.Mock).mockResolvedValue({ isPremium: true });
    const useCase = new GrantRewardedAdBonusUseCase(
      adsPort,
      aiUsageRepository,
      subscriptionPort,
    );

    await expect(useCase.execute()).resolves.toBe('premium');
    expect(adsPort.showRewardedAd).not.toHaveBeenCalled();
  });
});
