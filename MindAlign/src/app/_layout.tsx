import '@/global.css';

import { DarkTheme, DefaultTheme, ThemeProvider, Stack } from 'expo-router';

import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { DatabaseProvider } from '@/infrastructure/database/database-provider';
import { AppContainerProvider } from '@/infrastructure/di/app-container';
import { FirebaseProvider } from '@/infrastructure/firebase/firebase-provider';
import { I18nProvider } from '@/presentation/i18n/i18n-provider';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <DatabaseProvider>
      <FirebaseProvider>
        <I18nProvider>
          <AppContainerProvider>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <AnimatedSplashOverlay />
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="excuse/[habitId]"
                options={{ title: 'Bahane Sohbeti', presentation: 'modal' }}
              />
            </Stack>
            </ThemeProvider>
          </AppContainerProvider>
        </I18nProvider>
      </FirebaseProvider>
    </DatabaseProvider>
  );
}
