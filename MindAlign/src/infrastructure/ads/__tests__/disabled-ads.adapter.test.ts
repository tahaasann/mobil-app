import { DisabledAdsAdapter } from '@/infrastructure/ads/disabled-ads.adapter';

describe('DisabledAdsAdapter', () => {
  it('reports ads as unavailable', async () => {
    const adapter = new DisabledAdsAdapter();

    expect(adapter.isAvailable()).toBe(false);
    await expect(adapter.isRewardedReady()).resolves.toBe(false);
    await expect(adapter.showRewardedAd()).resolves.toBe('unavailable');
    await expect(adapter.requestConsent()).resolves.toBeUndefined();
  });
});
