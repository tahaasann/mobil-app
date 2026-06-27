import { BlurView } from 'expo-blur';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { useEffect, useState, type ReactNode } from 'react';
import { AccessibilityInfo, Platform, View, type ViewProps } from 'react-native';

import { useAppTheme } from '@/presentation/theme/theme-provider';
import { resolveGlassSurfaceMode } from '@/presentation/components/glass-surface';

export { resolveGlassSurfaceMode } from '@/presentation/components/glass-surface';
export type { GlassSurfaceMode } from '@/presentation/components/glass-surface';

type GlassCardProps = ViewProps & {
  children: ReactNode;
  testID?: string;
};

export function GlassCard({ children, className, testID, ...rest }: GlassCardProps) {
  const { resolved } = useAppTheme();
  const [reduceTransparency, setReduceTransparency] = useState(false);

  useEffect(() => {
    void AccessibilityInfo.isReduceTransparencyEnabled().then(setReduceTransparency);
  }, []);

  const mode = resolveGlassSurfaceMode({
    reduceTransparency,
    liquidGlassAvailable: isLiquidGlassAvailable(),
    platformOs: Platform.OS,
  });

  const surfaceClassName = `overflow-hidden rounded-2xl border border-white/20 ${className ?? ''}`;

  if (mode === 'liquid') {
    return (
      <GlassView
        testID={testID ?? 'glass-card'}
        glassEffectStyle={resolved === 'dark' ? 'regular' : 'clear'}
        className={surfaceClassName}
        {...rest}
      >
        {children}
      </GlassView>
    );
  }

  if (mode === 'blur') {
    return (
      <BlurView
        testID={testID ?? 'glass-card'}
        intensity={45}
        tint={resolved === 'dark' ? 'dark' : 'light'}
        className={surfaceClassName}
        {...rest}
      >
        {children}
      </BlurView>
    );
  }

  return (
    <View
      testID={testID ?? 'glass-card'}
      className={`${surfaceClassName} bg-surface/95 dark:bg-surface-dark/95`}
      {...rest}
    >
      {children}
    </View>
  );
}
