import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { GlassCard } from '@/presentation/components/glass-card';
import { resolveGlassSurfaceMode } from '@/presentation/components/glass-surface';
import { AppThemeProvider } from '@/presentation/theme/theme-provider';
import { resolveGlassVariantTokens } from '@/presentation/theme/glass-tokens';

function renderGlassCard(ui: React.ReactElement) {
  return render(<AppThemeProvider>{ui}</AppThemeProvider>);
}

describe('GlassCard surface mode', () => {
  it('uses opaque fallback when reduce transparency is enabled', () => {
    expect(
      resolveGlassSurfaceMode({
        reduceTransparency: true,
        liquidGlassAvailable: true,
        platformOs: 'ios',
      }),
    ).toBe('opaque');
  });

  it('prefers liquid glass on supported iOS devices', () => {
    expect(
      resolveGlassSurfaceMode({
        reduceTransparency: false,
        liquidGlassAvailable: true,
        platformOs: 'ios',
      }),
    ).toBe('liquid');
  });

  it('falls back to blur on other platforms', () => {
    expect(
      resolveGlassSurfaceMode({
        reduceTransparency: false,
        liquidGlassAvailable: false,
        platformOs: 'android',
      }),
    ).toBe('blur');
  });
});

describe('glass variant tokens', () => {
  it('assigns stronger blur and accent border to accent variant', () => {
    const elevated = resolveGlassVariantTokens('elevated', 'light');
    const accent = resolveGlassVariantTokens('accent', 'light');

    expect(accent.blurIntensity).toBeGreaterThan(elevated.blurIntensity);
    expect(accent.borderClassName).toContain('accent');
  });

  it('uses regular liquid glass in dark theme', () => {
    expect(resolveGlassVariantTokens('elevated', 'dark').liquidGlassStyle).toBe('regular');
    expect(resolveGlassVariantTokens('elevated', 'light').liquidGlassStyle).toBe('clear');
  });
});

describe('GlassCard variants', () => {
  it('renders elevated variant by default', async () => {
    await renderGlassCard(
      <GlassCard>
        <Text>Elevated card</Text>
      </GlassCard>,
    );

    expect(screen.getByTestId('glass-card-elevated')).toBeOnTheScreen();
  });

  it('renders subtle and accent variants with distinct test ids', async () => {
    await renderGlassCard(
      <>
        <GlassCard variant="subtle">
          <Text>Subtle</Text>
        </GlassCard>
        <GlassCard variant="accent">
          <Text>Accent</Text>
        </GlassCard>
      </>,
    );

    expect(screen.getByTestId('glass-card-subtle')).toBeOnTheScreen();
    expect(screen.getByTestId('glass-card-accent')).toBeOnTheScreen();
  });

  it('respects custom testID over variant id', async () => {
    await renderGlassCard(
      <GlassCard variant="accent" testID="custom-card">
        <Text>Custom</Text>
      </GlassCard>,
    );

    expect(screen.getByTestId('custom-card')).toBeOnTheScreen();
  });
});
