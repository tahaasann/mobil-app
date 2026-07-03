import type { SubscriptionPort } from '@/application/ports/subscription.port';
import { isProductionEnv } from '@/infrastructure/config/production-guard';
import { MockSubscriptionAdapter } from '@/infrastructure/subscriptions/mock-subscription.adapter';
import { RevenueCatSubscriptionAdapter } from '@/infrastructure/subscriptions/revenuecat-subscription.adapter';

export function hasRevenueCatApiKey(): boolean {
  return Boolean(
    process.env.EXPO_PUBLIC_REVENUECAT_API_KEY?.trim() ||
    process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID?.trim() ||
    process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS?.trim(),
  );
}

export function createSubscriptionPort(): SubscriptionPort {
  if (process.env.EXPO_PUBLIC_SUBSCRIPTION_MOCK === 'true') {
    if (isProductionEnv()) {
      throw new Error('EXPO_PUBLIC_SUBSCRIPTION_MOCK is not allowed in production');
    }
    return new MockSubscriptionAdapter();
  }
  if (!hasRevenueCatApiKey()) {
    if (isProductionEnv()) {
      throw new Error('RevenueCat API key is required in production');
    }
    return new MockSubscriptionAdapter();
  }
  return new RevenueCatSubscriptionAdapter();
}
