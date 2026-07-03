import type { AdsPort } from '@/application/ports/ads.port';
import { DisabledAdsAdapter } from '@/infrastructure/ads/disabled-ads.adapter';
import { MockAdsAdapter } from '@/infrastructure/ads/mock-ads.adapter';
import { isProductionEnv } from '@/infrastructure/config/production-guard';

export function createAdsPort(): AdsPort {
  if (process.env.EXPO_PUBLIC_ADS_MOCK === 'true') {
    if (isProductionEnv()) {
      throw new Error('EXPO_PUBLIC_ADS_MOCK is not allowed in production');
    }
    return new MockAdsAdapter({ available: true });
  }

  return new DisabledAdsAdapter();
}
