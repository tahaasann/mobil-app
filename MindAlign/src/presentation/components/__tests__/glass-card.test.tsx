import { resolveGlassSurfaceMode } from '@/presentation/components/glass-surface';

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
