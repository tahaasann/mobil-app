import type { AdsPort, RewardedAdResult } from '@/application/ports/ads.port';

/** Production-safe ads adapter while AdMob integration is disabled. */
export class DisabledAdsAdapter implements AdsPort {
  isAvailable(): boolean {
    return false;
  }

  async requestConsent(): Promise<void> {}

  async isRewardedReady(): Promise<boolean> {
    return false;
  }

  async showRewardedAd(): Promise<RewardedAdResult> {
    return 'unavailable';
  }
}
