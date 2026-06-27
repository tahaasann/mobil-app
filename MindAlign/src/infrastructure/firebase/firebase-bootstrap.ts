import { Platform } from 'react-native';

import { getApp } from '@react-native-firebase/app';
import {
  ReactNativeFirebaseAppCheckProvider,
  getToken,
  initializeAppCheck,
} from '@react-native-firebase/app-check';

export type FirebaseBootstrapStatus = 'idle' | 'ready' | 'skipped' | 'error';

export type FirebaseBootstrapResult = {
  status: FirebaseBootstrapStatus;
  message?: string;
};

function getDebugToken(): string | undefined {
  if (Platform.OS === 'android') {
    return process.env.EXPO_PUBLIC_FIREBASE_APP_CHECK_DEBUG_TOKEN_ANDROID;
  }
  if (Platform.OS === 'ios') {
    return process.env.EXPO_PUBLIC_FIREBASE_APP_CHECK_DEBUG_TOKEN_IOS;
  }
  return undefined;
}

export async function bootstrapFirebase(): Promise<FirebaseBootstrapResult> {
  if (Platform.OS === 'web') {
    return { status: 'skipped', message: 'Firebase native modules are unavailable on web' };
  }

  try {
    const app = getApp();
    const debugToken = getDebugToken();

    const provider = new ReactNativeFirebaseAppCheckProvider();
    provider.configure({
      android: {
        provider: __DEV__ ? 'debug' : 'playIntegrity',
        ...(debugToken ? { debugToken } : {}),
      },
      apple: {
        provider: __DEV__ ? 'debug' : 'appAttestWithDeviceCheckFallback',
        ...(debugToken ? { debugToken } : {}),
      },
      web: {
        provider: 'reCaptchaV3',
        siteKey: 'unused',
      },
    });

    const appCheck = await initializeAppCheck(app, {
      provider,
      isTokenAutoRefreshEnabled: true,
    });

    const { token } = await getToken(appCheck, true);
    if (!token) {
      return { status: 'error', message: 'App Check token empty' };
    }

    return { status: 'ready', message: 'Firebase App Check initialized' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown Firebase bootstrap error';
    return { status: 'error', message };
  }
}
