import { createDefaultAppSettings } from '@/domain/entities/app-settings';
import { resolveBootPreferences } from '@/presentation/bootstrap/load-boot-preferences';

describe('resolveBootPreferences (T-225 theme hydrate)', () => {
  it('uses saved dark theme from SQLite settings on boot', () => {
    const settings = { ...createDefaultAppSettings(), theme: 'dark' as const };

    expect(resolveBootPreferences(settings).theme).toBe('dark');
  });

  it('falls back to auto when no settings row exists', () => {
    expect(resolveBootPreferences(null).theme).toBe('auto');
  });
});

describe('resolveBootPreferences (T-227 language hydrate)', () => {
  it('uses saved Turkish language from SQLite settings on boot', () => {
    const settings = { ...createDefaultAppSettings(), language: 'tr' as const };

    expect(resolveBootPreferences(settings).language).toBe('tr');
  });

  it('falls back to en when no settings row exists', () => {
    expect(resolveBootPreferences(null).language).toBe('en');
  });
});
