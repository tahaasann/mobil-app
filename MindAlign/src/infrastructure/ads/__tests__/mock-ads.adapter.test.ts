import { MockAdsAdapter } from '@/infrastructure/ads/mock-ads.adapter';

describe('MockAdsAdapter', () => {
  it('returns unavailable when not configured as available', async () => {
    const adapter = new MockAdsAdapter();

    expect(adapter.isAvailable()).toBe(false);
    await expect(adapter.showRewardedAd()).resolves.toBe('unavailable');
  });

  it('returns configured rewarded result when available', async () => {
    const adapter = new MockAdsAdapter({ available: true });
    adapter.setNextResult('dismissed');

    expect(adapter.isAvailable()).toBe(true);
    await expect(adapter.isRewardedReady()).resolves.toBe(true);
    await expect(adapter.showRewardedAd()).resolves.toBe('dismissed');
    await expect(adapter.requestConsent()).resolves.toBeUndefined();
  });
});
