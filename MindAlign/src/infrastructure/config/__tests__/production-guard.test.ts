import {
  assertProductionConfig,
  assertProductionConfigFromEnv,
  collectProductionConfigErrors,
  isProductionEnv,
  PRODUCTION_FORBIDDEN_DEBUG_TOKENS,
  PRODUCTION_MOCK_FLAGS,
  PRODUCTION_REVENUECAT_KEYS,
  PRODUCTION_ADMOB_KEYS,
} from '@/infrastructure/config/production-guard';
import { parseAppEnv, resolveAppEnv } from '@/infrastructure/config/app-env';

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

function clearProductionEnvFlags() {
  for (const flag of PRODUCTION_MOCK_FLAGS) {
    delete process.env[flag];
  }
  for (const token of PRODUCTION_FORBIDDEN_DEBUG_TOKENS) {
    delete process.env[token];
  }
  for (const key of PRODUCTION_REVENUECAT_KEYS) {
    delete process.env[key];
  }
  for (const key of PRODUCTION_ADMOB_KEYS) {
    delete process.env[key];
  }
}

function setValidProductionKeys() {
  process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID = 'rc_android_test';
  process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS = 'rc_ios_test';
  process.env.EXPO_PUBLIC_ADMOB_APP_ID_ANDROID = 'admob_app_android';
  process.env.EXPO_PUBLIC_ADMOB_APP_ID_IOS = 'admob_app_ios';
  process.env.EXPO_PUBLIC_ADMOB_REWARDED_UNIT_ID_ANDROID = 'admob_reward_android';
  process.env.EXPO_PUBLIC_ADMOB_REWARDED_UNIT_ID_IOS = 'admob_reward_ios';
}

describe('production-guard', () => {
  afterEach(() => {
    mockExpoConfig.extra.appEnv = 'development';
    delete process.env.APP_ENV;
    delete process.env.EXPO_PUBLIC_REVENUECAT_API_KEY;
    clearProductionEnvFlags();
  });

  it('allows development env without production keys', () => {
    mockExpoConfig.extra.appEnv = 'development';
    process.env.EXPO_PUBLIC_AI_MOCK = 'true';
    expect(() => assertProductionConfig()).not.toThrow();
    expect(isProductionEnv()).toBe(false);
  });

  it.each(PRODUCTION_MOCK_FLAGS)('throws when %s is enabled in production', (flag) => {
    mockExpoConfig.extra.appEnv = 'production';
    setValidProductionKeys();
    process.env[flag] = 'true';
    expect(() => assertProductionConfig()).toThrow(new RegExp(flag));
  });

  it.each(PRODUCTION_FORBIDDEN_DEBUG_TOKENS)('throws when %s is set in production', (token) => {
    mockExpoConfig.extra.appEnv = 'production';
    setValidProductionKeys();
    process.env[token] = 'debug-token-value';
    expect(() => assertProductionConfig()).toThrow(new RegExp(token));
  });

  it.each(PRODUCTION_REVENUECAT_KEYS)('throws when %s is missing in production', (key) => {
    mockExpoConfig.extra.appEnv = 'production';
    clearProductionEnvFlags();
    setValidProductionKeys();
    delete process.env[key];
    expect(() => assertProductionConfig()).toThrow(new RegExp(key));
  });

  it.each(PRODUCTION_ADMOB_KEYS)('throws when %s is missing in production', (key) => {
    mockExpoConfig.extra.appEnv = 'production';
    clearProductionEnvFlags();
    setValidProductionKeys();
    delete process.env[key];
    expect(() => assertProductionConfig()).toThrow(new RegExp(key));
  });

  it('passes with valid production configuration', () => {
    mockExpoConfig.extra.appEnv = 'production';
    clearProductionEnvFlags();
    setValidProductionKeys();
    expect(() => assertProductionConfig()).not.toThrow();
    expect(isProductionEnv()).toBe(true);
  });
});

describe('parseAppEnv (strict fail-closed)', () => {
  it('defaults unset APP_ENV to development', () => {
    expect(parseAppEnv(undefined)).toBe('development');
    expect(parseAppEnv('')).toBe('development');
  });

  it('accepts valid APP_ENV values', () => {
    expect(parseAppEnv('development')).toBe('development');
    expect(parseAppEnv('preview')).toBe('preview');
    expect(parseAppEnv('production')).toBe('production');
  });

  it('throws on invalid APP_ENV values', () => {
    expect(() => parseAppEnv('prod')).toThrow(/Invalid APP_ENV/);
    expect(() => parseAppEnv('staging')).toThrow(/Invalid APP_ENV/);
  });

  it('resolveAppEnv prefers expo config extra over process env', () => {
    expect(
      resolveAppEnv({
        appEnvFromConfig: 'production',
        appEnvFromProcess: 'development',
      }),
    ).toBe('production');
  });
});

describe('collectProductionConfigErrors', () => {
  it('returns no errors outside production', () => {
    expect(collectProductionConfigErrors({ EXPO_PUBLIC_AI_MOCK: 'true' }, 'development')).toEqual(
      [],
    );
  });

  it('aggregates all production violations', () => {
    const errors = collectProductionConfigErrors(
      {
        EXPO_PUBLIC_AUTH_MOCK: 'true',
        EXPO_PUBLIC_AI_MOCK: 'true',
        EXPO_PUBLIC_FIREBASE_APP_CHECK_DEBUG_TOKEN_ANDROID: 'debug',
      },
      'production',
    );

    expect(errors).toEqual(
      expect.arrayContaining([
        'EXPO_PUBLIC_AUTH_MOCK',
        'EXPO_PUBLIC_AI_MOCK',
        'EXPO_PUBLIC_FIREBASE_APP_CHECK_DEBUG_TOKEN_ANDROID',
        'EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID',
        'EXPO_PUBLIC_REVENUECAT_API_KEY_IOS',
        'EXPO_PUBLIC_ADMOB_APP_ID_ANDROID',
        'EXPO_PUBLIC_ADMOB_APP_ID_IOS',
        'EXPO_PUBLIC_ADMOB_REWARDED_UNIT_ID_ANDROID',
        'EXPO_PUBLIC_ADMOB_REWARDED_UNIT_ID_IOS',
      ]),
    );
  });
});

describe('assertProductionConfigFromEnv (CI gate)', () => {
  it('passes clean production env fixture', () => {
    expect(() =>
      assertProductionConfigFromEnv({
        APP_ENV: 'production',
        EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID:
          process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID ?? 'ci-android-key',
        EXPO_PUBLIC_REVENUECAT_API_KEY_IOS:
          process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS ?? 'ci-ios-key',
        EXPO_PUBLIC_ADMOB_APP_ID_ANDROID:
          process.env.EXPO_PUBLIC_ADMOB_APP_ID_ANDROID ?? 'ci-admob-app-android',
        EXPO_PUBLIC_ADMOB_APP_ID_IOS:
          process.env.EXPO_PUBLIC_ADMOB_APP_ID_IOS ?? 'ci-admob-app-ios',
        EXPO_PUBLIC_ADMOB_REWARDED_UNIT_ID_ANDROID:
          process.env.EXPO_PUBLIC_ADMOB_REWARDED_UNIT_ID_ANDROID ?? 'ci-admob-reward-android',
        EXPO_PUBLIC_ADMOB_REWARDED_UNIT_ID_IOS:
          process.env.EXPO_PUBLIC_ADMOB_REWARDED_UNIT_ID_IOS ?? 'ci-admob-reward-ios',
      }),
    ).not.toThrow();
  });
});
