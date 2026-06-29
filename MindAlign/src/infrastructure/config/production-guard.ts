import Constants from 'expo-constants';

type AppEnv = 'development' | 'preview' | 'production';

function getAppEnv(): AppEnv {
  const value = Constants.expoConfig?.extra?.appEnv ?? process.env.APP_ENV ?? 'development';
  if (value === 'development' || value === 'preview' || value === 'production') {
    return value;
  }
  return 'development';
}

export function assertProductionConfig(): void {
  if (getAppEnv() !== 'production') {
    return;
  }

  const errors: string[] = [];

  if (process.env.EXPO_PUBLIC_AUTH_MOCK === 'true') errors.push('EXPO_PUBLIC_AUTH_MOCK');
  if (process.env.EXPO_PUBLIC_AI_MOCK === 'true') errors.push('EXPO_PUBLIC_AI_MOCK');
  if (process.env.EXPO_PUBLIC_SYNC_MOCK === 'true') errors.push('EXPO_PUBLIC_SYNC_MOCK');
  if (process.env.EXPO_PUBLIC_SUBSCRIPTION_MOCK === 'true') {
    errors.push('EXPO_PUBLIC_SUBSCRIPTION_MOCK');
  }
  if (process.env.EXPO_PUBLIC_ADS_MOCK === 'true') errors.push('EXPO_PUBLIC_ADS_MOCK');
  if (!process.env.EXPO_PUBLIC_REVENUECAT_API_KEY) errors.push('EXPO_PUBLIC_REVENUECAT_API_KEY');
  // AdMob native modülü geçici olarak devre dışı; tekrar etkinleştirildiğinde
  // EXPO_PUBLIC_ADMOB_* anahtarları burada zorunlu hale getirilebilir.

  if (errors.length > 0) {
    throw new Error(`Production configuration invalid: ${errors.join(', ')}`);
  }
}

export function isProductionEnv(): boolean {
  return getAppEnv() === 'production';
}
