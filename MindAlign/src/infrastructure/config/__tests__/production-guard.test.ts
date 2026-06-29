const mockExpoConfig = {
  extra: { appEnv: 'development' as 'development' | 'preview' | 'production' },
};

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    get expoConfig() {
      return mockExpoConfig;
    },
  },
}));

import { assertProductionConfig, isProductionEnv } from '@/infrastructure/config/production-guard';

const PRODUCTION_MOCK_FLAGS = [
  'EXPO_PUBLIC_AUTH_MOCK',
  'EXPO_PUBLIC_AI_MOCK',
  'EXPO_PUBLIC_SYNC_MOCK',
  'EXPO_PUBLIC_SUBSCRIPTION_MOCK',
  'EXPO_PUBLIC_ADS_MOCK',
] as const;

function clearMockFlags() {
  for (const flag of PRODUCTION_MOCK_FLAGS) {
    delete process.env[flag];
  }
}

describe('production-guard', () => {
  afterEach(() => {
    mockExpoConfig.extra.appEnv = 'development';
    delete process.env.APP_ENV;
    delete process.env.EXPO_PUBLIC_REVENUECAT_API_KEY;
    clearMockFlags();
  });

  it('allows development env without production keys', () => {
    mockExpoConfig.extra.appEnv = 'development';
    process.env.EXPO_PUBLIC_AI_MOCK = 'true';
    expect(() => assertProductionConfig()).not.toThrow();
    expect(isProductionEnv()).toBe(false);
  });

  it('throws when mock flags are enabled in production', () => {
    mockExpoConfig.extra.appEnv = 'production';
    process.env.EXPO_PUBLIC_REVENUECAT_API_KEY = 'rc_test_key';
    process.env.EXPO_PUBLIC_AI_MOCK = 'true';
    expect(() => assertProductionConfig()).toThrow(/EXPO_PUBLIC_AI_MOCK/);
  });

  it('throws when RevenueCat key is missing in production', () => {
    mockExpoConfig.extra.appEnv = 'production';
    clearMockFlags();
    delete process.env.EXPO_PUBLIC_REVENUECAT_API_KEY;
    expect(() => assertProductionConfig()).toThrow(/EXPO_PUBLIC_REVENUECAT_API_KEY/);
  });

  it('passes with valid production configuration', () => {
    mockExpoConfig.extra.appEnv = 'production';
    process.env.EXPO_PUBLIC_REVENUECAT_API_KEY = 'rc_test_key';
    clearMockFlags();
    expect(() => assertProductionConfig()).not.toThrow();
    expect(isProductionEnv()).toBe(true);
  });
});
