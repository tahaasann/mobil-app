import type { AdsPort, RewardedAdResult } from '@/application/ports/ads.port';

export class MockAdsAdapter implements AdsPort {
  private nextResult: RewardedAdResult = 'rewarded';

  setNextResult(result: RewardedAdResult): void {
    this.nextResult = result;
  }

  async requestConsent(): Promise<void> {}

  async isRewardedReady(): Promise<boolean> {
    return true;
  }

  async showRewardedAd(): Promise<RewardedAdResult> {
    return this.nextResult;
  }
}
