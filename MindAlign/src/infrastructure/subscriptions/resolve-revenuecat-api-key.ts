export type RevenueCatPlatform = 'android' | 'ios' | 'default';

export function resolveRevenueCatApiKey(
  platform: RevenueCatPlatform,
  env: NodeJS.ProcessEnv = process.env,
): string | undefined {
  const legacy = env.EXPO_PUBLIC_REVENUECAT_API_KEY?.trim();

  if (platform === 'android') {
    return env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID?.trim() || legacy;
  }

  if (platform === 'ios') {
    return env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS?.trim() || legacy;
  }

  return legacy;
}
