import {
  createSubscriptionPort,
  hasRevenueCatApiKey,
} from '@/infrastructure/subscriptions/create-subscription-port';
import { MockSubscriptionAdapter } from '@/infrastructure/subscriptions/mock-subscription.adapter';
import { RevenueCatSubscriptionAdapter } from '@/infrastructure/subscriptions/revenuecat-subscription.adapter';

const mockIsProductionEnv = jest.fn(() => false);

jest.mock('@/infrastructure/config/production-guard', () => ({
  isProductionEnv: () => mockIsProductionEnv(),
}));

describe('hasRevenueCatApiKey', () => {
  afterEach(() => {
    delete process.env.EXPO_PUBLIC_REVENUECAT_API_KEY;
    delete process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID;
    delete process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS;
  });

  it('returns false when no RevenueCat keys are set', () => {
    expect(hasRevenueCatApiKey()).toBe(false);
  });

  it('returns true when a platform-specific key is set', () => {
    process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID = 'rc_android';
    expect(hasRevenueCatApiKey()).toBe(true);
  });
});

describe('createSubscriptionPort', () => {
  afterEach(() => {
    delete process.env.EXPO_PUBLIC_SUBSCRIPTION_MOCK;
    delete process.env.EXPO_PUBLIC_REVENUECAT_API_KEY;
    delete process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID;
    delete process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS;
    mockIsProductionEnv.mockReturnValue(false);
  });

  it('returns MockSubscriptionAdapter when SUBSCRIPTION_MOCK=true in development', () => {
    process.env.EXPO_PUBLIC_SUBSCRIPTION_MOCK = 'true';
    expect(createSubscriptionPort()).toBeInstanceOf(MockSubscriptionAdapter);
  });

  it('throws when SUBSCRIPTION_MOCK=true in production', () => {
    process.env.EXPO_PUBLIC_SUBSCRIPTION_MOCK = 'true';
    mockIsProductionEnv.mockReturnValue(true);
    expect(() => createSubscriptionPort()).toThrow(/EXPO_PUBLIC_SUBSCRIPTION_MOCK/);
  });

  it('returns MockSubscriptionAdapter when no API key in development', () => {
    expect(createSubscriptionPort()).toBeInstanceOf(MockSubscriptionAdapter);
  });

  it('throws when no API key in production', () => {
    mockIsProductionEnv.mockReturnValue(true);
    expect(() => createSubscriptionPort()).toThrow(/RevenueCat API key is required/);
  });

  it('returns RevenueCatSubscriptionAdapter when a platform key is set', () => {
    process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID = 'rc_android';
    expect(createSubscriptionPort()).toBeInstanceOf(RevenueCatSubscriptionAdapter);
  });
});
