import { Redirect, type Href } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '@/infrastructure/firebase/auth-provider';
import { useAppSettings } from '@/presentation/hooks/use-app-settings';

export default function IndexRoute() {
  const { settings, isLoading: settingsLoading } = useAppSettings();
  const { user, isLoading: authLoading } = useAuth();

  if (settingsLoading || authLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-ivory dark:bg-charcoal">
        <ActivityIndicator />
      </View>
    );
  }

  if (!settings?.onboardingCompleted) {
    return <Redirect href="/onboarding" />;
  }

  if (!user) {
    return <Redirect href={'/auth' as Href} />;
  }

  return <Redirect href="/(tabs)" />;
}
