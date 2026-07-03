export type GlassVariant = 'subtle' | 'elevated' | 'accent';
export type GlassTheme = 'light' | 'dark';

export type GlassVariantTokens = {
  blurIntensity: number;
  borderClassName: string;
  shadowClassName: string;
  opaqueClassName: string;
  liquidGlassStyle: 'clear' | 'regular';
};

const VARIANTS: Record<GlassVariant, Omit<GlassVariantTokens, 'liquidGlassStyle' | 'opaqueClassName'>> =
  {
    subtle: {
      blurIntensity: 32,
      borderClassName: 'border border-white/12 dark:border-white/10',
      shadowClassName: '',
    },
    elevated: {
      blurIntensity: 48,
      borderClassName: 'border border-white/22 dark:border-white/16',
      shadowClassName: 'shadow-sm shadow-black/5 dark:shadow-black/30',
    },
    accent: {
      blurIntensity: 52,
      borderClassName: 'border border-accent/35 dark:border-accent/45',
      shadowClassName: 'shadow-md shadow-accent/15 dark:shadow-accent/25',
    },
  };

export function resolveGlassVariantTokens(
  variant: GlassVariant,
  theme: GlassTheme,
): GlassVariantTokens {
  const base = VARIANTS[variant];

  return {
    ...base,
    liquidGlassStyle: theme === 'dark' ? 'regular' : 'clear',
    opaqueClassName:
      variant === 'accent'
        ? 'bg-surface/90 dark:bg-surface-dark/92'
        : 'bg-surface/95 dark:bg-surface-dark/95',
  };
}

export function resolveGlassCardTestId(variant: GlassVariant, testID?: string): string {
  if (testID) {
    return testID;
  }
  return `glass-card-${variant}`;
}
