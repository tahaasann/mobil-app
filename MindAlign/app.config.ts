import type { ConfigContext, ExpoConfig } from 'expo/config';

type AppEnv = 'development' | 'preview' | 'production';

const VALID_APP_ENVS: readonly AppEnv[] = ['development', 'preview', 'production'];

/** Duplicated from app-env.ts — app.config runs in Node without TS path resolution. */
function parseAppEnv(value: unknown): AppEnv {
  if (value === undefined || value === null || value === '') {
    return 'development';
  }
  if (typeof value === 'string' && (VALID_APP_ENVS as readonly string[]).includes(value)) {
    return value as AppEnv;
  }
  throw new Error(
    `Invalid APP_ENV "${String(value)}". Expected one of: ${VALID_APP_ENVS.join(', ')}`,
  );
}

export default ({ config }: ConfigContext): ExpoConfig => {
  const appEnv = parseAppEnv(process.env.APP_ENV);

  const plugins: ExpoConfig['plugins'] = [
      'expo-router',
      'expo-sqlite',
      'expo-dev-client',
      '@react-native-firebase/app',
      '@react-native-firebase/app-check',
      '@react-native-firebase/auth',
      '@react-native-firebase/analytics',
      '@react-native-firebase/crashlytics',
      [
        'expo-notifications',
        {
          icon: './assets/images/icon.png',
          color: '#208AEF',
        },
      ],
      // AdMob (react-native-google-mobile-ads) su an devre disi. Native baslangic
      // crash'ini onlemek icin paket tamamen kaldirildi; ileride tekrar eklenecek.
      [
        'expo-build-properties',
        {
          android: {
            kotlinVersion: '2.1.20',
            allowBackup: false,
          },
          ios: {
            useFrameworks: 'static',
            forceStaticLinking: ['RNFBApp', 'RNFBAppCheck', 'RNFBAppCheckModule'],
          },
        },
      ],
      [
        'expo-splash-screen',
        {
          backgroundColor: '#208AEF',
          android: {
            image: './assets/images/splash-icon.png',
            imageWidth: 76,
          },
        },
      ],
    ];

  return {
    ...config,
    name: 'MindAlign',
    slug: 'MindAlign',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'mindalign',
    userInterfaceStyle: 'automatic',
    ios: {
      bundleIdentifier: 'com.tahaasann.mindalign',
      icon: './assets/expo.icon',
      googleServicesFile: './GoogleService-Info.plist',
    },
    android: {
      package: 'com.tahaasann.mindalign',
      googleServicesFile: './google-services.json',
      blockedPermissions: [
        'android.permission.SYSTEM_ALERT_WINDOW',
        'android.permission.READ_EXTERNAL_STORAGE',
        'android.permission.WRITE_EXTERNAL_STORAGE',
      ],
      adaptiveIcon: {
        backgroundColor: '#E6F4FE',
        foregroundImage: './assets/images/android-icon-foreground.png',
        backgroundImage: './assets/images/android-icon-background.png',
        monochromeImage: './assets/images/android-icon-monochrome.png',
      },
      predictiveBackGestureEnabled: false,
    },
    web: {
      output: 'static',
      favicon: './assets/images/favicon.png',
      bundler: 'metro',
    },
    plugins,
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      appEnv,
      ...config.extra,
      eas: {
        projectId: 'b2bde083-6ce5-414e-b60a-b7895a2695c2',
      },
    },
  };
};
