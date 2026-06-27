import '@/global.css';

import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { DatabaseProvider } from '@/infrastructure/database/database-provider';
import { AppContainerProvider } from '@/infrastructure/di/app-container';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <DatabaseProvider>
      <AppContainerProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <AnimatedSplashOverlay />
          <AppTabs />
        </ThemeProvider>
      </AppContainerProvider>
    </DatabaseProvider>
  );
}
