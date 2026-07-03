/**
 * CI production gate — run via `pnpm validate:production`.
 * Uses real process.env when EAS/GitHub secrets are injected.
 */
import { assertProductionConfigFromEnv } from '@/infrastructure/config/production-guard';

describe('production env validation (CI gate)', () => {
  it('passes when production env has platform RC keys and no mock flags', () => {
    const env = {
      APP_ENV: 'production',
      EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID:
        process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID ?? 'ci-android-key',
      EXPO_PUBLIC_REVENUECAT_API_KEY_IOS:
        process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS ?? 'ci-ios-key',
      EXPO_PUBLIC_ADMOB_APP_ID_ANDROID:
        process.env.EXPO_PUBLIC_ADMOB_APP_ID_ANDROID ?? 'ci-admob-app-android',
      EXPO_PUBLIC_ADMOB_APP_ID_IOS: process.env.EXPO_PUBLIC_ADMOB_APP_ID_IOS ?? 'ci-admob-app-ios',
      EXPO_PUBLIC_ADMOB_REWARDED_UNIT_ID_ANDROID:
        process.env.EXPO_PUBLIC_ADMOB_REWARDED_UNIT_ID_ANDROID ?? 'ci-admob-reward-android',
      EXPO_PUBLIC_ADMOB_REWARDED_UNIT_ID_IOS:
        process.env.EXPO_PUBLIC_ADMOB_REWARDED_UNIT_ID_IOS ?? 'ci-admob-reward-ios',
    };

    expect(() => assertProductionConfigFromEnv(env)).not.toThrow();
  });

  it('fails when mock flags are present in production env', () => {
    expect(() =>
      assertProductionConfigFromEnv({
        APP_ENV: 'production',
        EXPO_PUBLIC_AI_MOCK: 'true',
        EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID: 'android-key',
        EXPO_PUBLIC_REVENUECAT_API_KEY_IOS: 'ios-key',
        EXPO_PUBLIC_ADMOB_APP_ID_ANDROID: 'admob-app-android',
        EXPO_PUBLIC_ADMOB_APP_ID_IOS: 'admob-app-ios',
        EXPO_PUBLIC_ADMOB_REWARDED_UNIT_ID_ANDROID: 'admob-reward-android',
        EXPO_PUBLIC_ADMOB_REWARDED_UNIT_ID_IOS: 'admob-reward-ios',
      }),
    ).toThrow(/EXPO_PUBLIC_AI_MOCK/);
  });
});
