import type { ConfigContext, ExpoConfig } from 'expo/config';

type AppEnv = 'development' | 'preview' | 'production';

function getAppEnv(): AppEnv {
  const value = process.env.APP_ENV ?? 'development';
  if (value === 'development' || value === 'preview' || value === 'production') {
    return value;
  }
  return 'development';
}

export default ({ config }: ConfigContext): ExpoConfig => {
  const appEnv = getAppEnv();

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
    plugins: [
      'expo-router',
      'expo-sqlite',
      'expo-dev-client',
      '@react-native-firebase/app',
      '@react-native-firebase/app-check',
      [
        'expo-build-properties',
        {
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
    ],
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
