import { BlurView } from 'expo-blur';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { useEffect, useState, type ReactNode } from 'react';
import { AccessibilityInfo, Platform, View, type ViewProps } from 'react-native';

import { useAppTheme } from '@/presentation/theme/theme-provider';
import { resolveGlassSurfaceMode } from '@/presentation/components/glass-surface';
import {
  resolveGlassCardTestId,
  resolveGlassVariantTokens,
  type GlassVariant,
} from '@/presentation/theme/glass-tokens';

export { resolveGlassSurfaceMode } from '@/presentation/components/glass-surface';
export type { GlassSurfaceMode } from '@/presentation/components/glass-surface';
export type { GlassVariant } from '@/presentation/theme/glass-tokens';

type GlassCardProps = ViewProps & {
  children: ReactNode;
  testID?: string;
  variant?: GlassVariant;
};

export function GlassCard({
  children,
  className,
  testID,
  variant = 'elevated',
  ...rest
}: GlassCardProps) {
  const { resolved } = useAppTheme();
  const [reduceTransparency, setReduceTransparency] = useState(false);

  useEffect(() => {
    void AccessibilityInfo.isReduceTransparencyEnabled().then(setReduceTransparency);
  }, []);

  const tokens = resolveGlassVariantTokens(variant, resolved);
  const mode = resolveGlassSurfaceMode({
    reduceTransparency,
    liquidGlassAvailable: isLiquidGlassAvailable(),
    platformOs: Platform.OS,
  });

  const surfaceClassName = [
    'overflow-hidden rounded-2xl',
    tokens.borderClassName,
    tokens.shadowClassName,
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  const cardTestID = resolveGlassCardTestId(variant, testID);

  if (mode === 'liquid') {
    return (
      <GlassView
        testID={cardTestID}
        glassEffectStyle={tokens.liquidGlassStyle}
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
        testID={cardTestID}
        intensity={tokens.blurIntensity}
        tint={resolved === 'dark' ? 'dark' : 'light'}
        className={surfaceClassName}
        {...rest}
      >
        {children}
      </BlurView>
    );
  }

  return (
    <View testID={cardTestID} className={`${surfaceClassName} ${tokens.opaqueClassName}`} {...rest}>
      {children}
    </View>
  );
}
