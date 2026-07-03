import type { AdsPort, RewardedAdResult } from '@/application/ports/ads.port';

type MockAdsAdapterOptions = {
  available?: boolean;
};

export class MockAdsAdapter implements AdsPort {
  private nextResult: RewardedAdResult = 'rewarded';
  private readonly available: boolean;

  constructor(options: MockAdsAdapterOptions = {}) {
    this.available = options.available ?? false;
  }

  isAvailable(): boolean {
    return this.available;
  }

  setNextResult(result: RewardedAdResult): void {
    this.nextResult = result;
  }

  async requestConsent(): Promise<void> {}

  async isRewardedReady(): Promise<boolean> {
    return this.available;
  }

  async showRewardedAd(): Promise<RewardedAdResult> {
    if (!this.available) {
      return 'unavailable';
    }
    return this.nextResult;
  }
}
