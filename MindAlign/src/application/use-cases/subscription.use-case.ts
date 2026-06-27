import type { AdsPort } from '@/application/ports/ads.port';
import type { SubscriptionPort } from '@/application/ports/subscription.port';
import { getWeekStartUtc } from '@/domain/ai/ai-quota';
import type { AiUsageRepository } from '@/application/ports/ai-usage-repository.port';

export class GetEntitlementUseCase {
  constructor(private readonly subscriptionPort: SubscriptionPort) {}

  execute() {
    return this.subscriptionPort.getEntitlement();
  }
}

export class PurchaseSubscriptionUseCase {
  constructor(private readonly subscriptionPort: SubscriptionPort) {}

  execute(packageIdentifier: string) {
    return this.subscriptionPort.purchase(packageIdentifier);
  }
}

export class RestorePurchasesUseCase {
  constructor(private readonly subscriptionPort: SubscriptionPort) {}

  execute() {
    return this.subscriptionPort.restorePurchases();
  }
}

export class GrantRewardedAdBonusUseCase {
  constructor(
    private readonly adsPort: AdsPort,
    private readonly aiUsageRepository: AiUsageRepository,
    private readonly subscriptionPort: SubscriptionPort,
  ) {}

  async execute(): Promise<'rewarded' | 'dismissed' | 'failed' | 'premium'> {
    const entitlement = await this.subscriptionPort.getEntitlement();
    if (entitlement.isPremium) {
      return 'premium';
    }

    await this.adsPort.requestConsent();

    const result = await this.adsPort.showRewardedAd();
    if (result !== 'rewarded') {
      return result;
    }

    const weekStart = getWeekStartUtc(new Date());
    await this.aiUsageRepository.addBonusForWeek(weekStart);
    return 'rewarded';
  }
}
