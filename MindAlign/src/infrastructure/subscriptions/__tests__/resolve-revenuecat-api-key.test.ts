import { resolveRevenueCatApiKey } from '@/infrastructure/subscriptions/resolve-revenuecat-api-key';

describe('resolveRevenueCatApiKey (T-214)', () => {
  const env = {
    EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID: 'rc_android_key',
    EXPO_PUBLIC_REVENUECAT_API_KEY_IOS: 'rc_ios_key',
  } as NodeJS.ProcessEnv;

  it('selects Android key on Android', () => {
    expect(resolveRevenueCatApiKey('android', env)).toBe('rc_android_key');
  });

  it('selects iOS key on iOS', () => {
    expect(resolveRevenueCatApiKey('ios', env)).toBe('rc_ios_key');
  });

  it('does not cross-use platform keys', () => {
    const androidOnly = {
      EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID: 'rc_android_key',
    } as NodeJS.ProcessEnv;

    expect(resolveRevenueCatApiKey('android', androidOnly)).toBe('rc_android_key');
    expect(resolveRevenueCatApiKey('ios', androidOnly)).toBeUndefined();
  });
});
