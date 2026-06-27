import { Redirect, type Href } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { useAppSettings } from '@/presentation/hooks/use-app-settings';

export default function IndexRoute() {
  const { settings, isLoading } = useAppSettings();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-ivory dark:bg-charcoal">
        <ActivityIndicator />
      </View>
    );
  }

  if (!settings?.onboardingCompleted) {
    return <Redirect href={'/onboarding/index' as Href} />;
  }

  return <Redirect href="/(tabs)" />;
}
