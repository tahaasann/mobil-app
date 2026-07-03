import Constants from 'expo-constants';

import { parseAppEnv, resolveAppEnv, type AppEnv } from './app-env';

/** Mock flags that must never be enabled in production builds. */
export const PRODUCTION_MOCK_FLAGS = [
  'EXPO_PUBLIC_AUTH_MOCK',
  'EXPO_PUBLIC_AI_MOCK',
  'EXPO_PUBLIC_SYNC_MOCK',
  'EXPO_PUBLIC_SUBSCRIPTION_MOCK',
  'EXPO_PUBLIC_ADS_MOCK',
  'EXPO_PUBLIC_NOTIFICATION_MOCK',
  'EXPO_PUBLIC_ANALYTICS_MOCK',
  'EXPO_PUBLIC_CRASHLYTICS_MOCK',
  'EXPO_PUBLIC_REMOTE_CONFIG_MOCK',
  'EXPO_PUBLIC_REVIEW_MOCK',
] as const;

/** Debug tokens must not ship in production — they bypass App Check. */
export const PRODUCTION_FORBIDDEN_DEBUG_TOKENS = [
  'EXPO_PUBLIC_FIREBASE_APP_CHECK_DEBUG_TOKEN_ANDROID',
  'EXPO_PUBLIC_FIREBASE_APP_CHECK_DEBUG_TOKEN_IOS',
] as const;

export const PRODUCTION_REVENUECAT_KEYS = [
  'EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID',
  'EXPO_PUBLIC_REVENUECAT_API_KEY_IOS',
] as const;

/** Required when AdMob adapter is re-enabled for Play monetization (T-266). */
export const PRODUCTION_ADMOB_KEYS = [
  'EXPO_PUBLIC_ADMOB_APP_ID_ANDROID',
  'EXPO_PUBLIC_ADMOB_APP_ID_IOS',
  'EXPO_PUBLIC_ADMOB_REWARDED_UNIT_ID_ANDROID',
  'EXPO_PUBLIC_ADMOB_REWARDED_UNIT_ID_IOS',
] as const;

export function getAppEnv(): AppEnv {
  return resolveAppEnv({
    appEnvFromConfig: Constants.expoConfig?.extra?.appEnv,
    appEnvFromProcess: process.env.APP_ENV,
  });
}

export function collectProductionConfigErrors(
  env: Record<string, string | undefined>,
  appEnv: AppEnv,
): string[] {
  if (appEnv !== 'production') {
    return [];
  }

  const errors: string[] = [];

  for (const flag of PRODUCTION_MOCK_FLAGS) {
    if (env[flag] === 'true') {
      errors.push(flag);
    }
  }

  for (const token of PRODUCTION_FORBIDDEN_DEBUG_TOKENS) {
    if (env[token]?.trim()) {
      errors.push(token);
    }
  }

  for (const key of PRODUCTION_REVENUECAT_KEYS) {
    if (!env[key]?.trim()) {
      errors.push(key);
    }
  }

  for (const key of PRODUCTION_ADMOB_KEYS) {
    if (!env[key]?.trim()) {
      errors.push(key);
    }
  }

  return errors;
}

export function assertProductionConfig(): void {
  const appEnv = getAppEnv();
  const errors = collectProductionConfigErrors(process.env, appEnv);

  if (errors.length > 0) {
    throw new Error(`Production configuration invalid: ${errors.join(', ')}`);
  }
}

export function assertProductionConfigFromEnv(env: Record<string, string | undefined>): void {
  const appEnv = parseAppEnv(env.APP_ENV);
  const errors = collectProductionConfigErrors(env, appEnv);

  if (errors.length > 0) {
    throw new Error(`Production configuration invalid: ${errors.join(', ')}`);
  }
}

export function isProductionEnv(): boolean {
  return getAppEnv() === 'production';
}
