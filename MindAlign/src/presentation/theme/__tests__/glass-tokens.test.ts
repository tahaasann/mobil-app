import { resolveGlassVariantTokens } from '@/presentation/theme/glass-tokens';

describe('glass-tokens', () => {
  it('defines distinct blur levels per variant', () => {
    expect(resolveGlassVariantTokens('subtle', 'light').blurIntensity).toBeLessThan(
      resolveGlassVariantTokens('elevated', 'light').blurIntensity,
    );
    expect(resolveGlassVariantTokens('elevated', 'light').blurIntensity).toBeLessThan(
      resolveGlassVariantTokens('accent', 'light').blurIntensity,
    );
  });
});
