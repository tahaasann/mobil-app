import { lookupTranslation, resolveTranslation } from '@/presentation/i18n/lookup';

describe('i18n lookup', () => {
  const resources = {
    en: {
      dashboard: {
        title: 'MindAlign',
        subtitle: 'Your habits today',
      },
      common: {
        loading: 'Loading…',
      },
    },
    tr: {
      dashboard: {
        title: 'MindAlign',
        subtitle: 'Bugünkü alışkanlıkların',
      },
    },
  };

  it('resolves nested keys for the active locale', () => {
    expect(lookupTranslation(resources.en, 'dashboard.subtitle')).toBe('Your habits today');
    expect(resolveTranslation('dashboard.subtitle', 'tr', resources)).toBe(
      'Bugünkü alışkanlıkların',
    );
  });

  it('falls back to English when a key is missing in the active locale', () => {
    expect(resolveTranslation('common.loading', 'tr', resources)).toBe('Loading…');
  });

  it('returns the key when no translation exists', () => {
    expect(resolveTranslation('missing.key', 'tr', resources)).toBe('missing.key');
  });
});
