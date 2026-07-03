import { createAdsPort } from '@/infrastructure/ads/create-ads-port';
import { DisabledAdsAdapter } from '@/infrastructure/ads/disabled-ads.adapter';
import { MockAdsAdapter } from '@/infrastructure/ads/mock-ads.adapter';

const mockIsProductionEnv = jest.fn(() => false);

jest.mock('@/infrastructure/config/production-guard', () => ({
  isProductionEnv: () => mockIsProductionEnv(),
}));

describe('createAdsPort', () => {
  afterEach(() => {
    delete process.env.EXPO_PUBLIC_ADS_MOCK;
    mockIsProductionEnv.mockReturnValue(false);
  });

  it('returns DisabledAdsAdapter when ADS_MOCK is not set', () => {
    const port = createAdsPort();
    expect(port).toBeInstanceOf(DisabledAdsAdapter);
    expect(port.isAvailable()).toBe(false);
  });

  it('returns MockAdsAdapter with ads available in development when ADS_MOCK=true', () => {
    process.env.EXPO_PUBLIC_ADS_MOCK = 'true';
    const port = createAdsPort();
    expect(port).toBeInstanceOf(MockAdsAdapter);
    expect(port.isAvailable()).toBe(true);
  });

  it('throws when ADS_MOCK is enabled in production', () => {
    process.env.EXPO_PUBLIC_ADS_MOCK = 'true';
    mockIsProductionEnv.mockReturnValue(true);
    expect(() => createAdsPort()).toThrow(/EXPO_PUBLIC_ADS_MOCK/);
  });
});
