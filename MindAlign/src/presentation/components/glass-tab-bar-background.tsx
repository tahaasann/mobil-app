import { BlurView } from 'expo-blur';
import { StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/presentation/theme/theme-provider';

export function GlassTabBarBackground() {
  const { resolved } = useAppTheme();

  return (
    <View style={StyleSheet.absoluteFill}>
      <BlurView
        intensity={72}
        tint={resolved === 'dark' ? 'dark' : 'light'}
        style={StyleSheet.absoluteFill}
      />
      <View
        className="absolute inset-x-0 top-0 h-px bg-white/25 dark:bg-white/10"
        pointerEvents="none"
      />
    </View>
  );
}
