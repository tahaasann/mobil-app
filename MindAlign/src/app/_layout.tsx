import '@/global.css';

import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { DatabaseProvider } from '@/infrastructure/database/database-provider';
import { AppContainerProvider } from '@/infrastructure/di/app-container';
import { AuthContainer } from '@/infrastructure/di/auth-container';
import { PlatformContainer } from '@/infrastructure/di/platform-container';
import { SubscriptionContainer } from '@/infrastructure/di/subscription-container';
import { FirebaseProvider } from '@/infrastructure/firebase/firebase-provider';
import { NotificationResponseHandler } from '@/infrastructure/notifications/notification-response-handler';
import { I18nProvider } from '@/presentation/i18n/i18n-provider';
import { AppThemeProvider, useAppTheme } from '@/presentation/theme/theme-provider';

function ThemedRootStack() {
  const { resolved } = useAppTheme();

  return (
    <ThemeProvider value={resolved === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="paywall" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="breathing" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen
          name="excuse/[habitId]"
          options={{ title: 'Bahane Sohbeti', presentation: 'modal' }}
        />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <DatabaseProvider>
      <FirebaseProvider>
        <I18nProvider>
          <AppThemeProvider>
            <PlatformContainer>
              <SubscriptionContainer>
                <AppContainerProvider>
                  <AuthContainer>
                    <NotificationResponseHandler>
                      <ThemedRootStack />
                    </NotificationResponseHandler>
                  </AuthContainer>
                </AppContainerProvider>
              </SubscriptionContainer>
            </PlatformContainer>
          </AppThemeProvider>
        </I18nProvider>
      </FirebaseProvider>
    </DatabaseProvider>
  );
}
