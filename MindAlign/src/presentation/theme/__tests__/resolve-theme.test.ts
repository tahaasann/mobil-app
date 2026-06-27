import { resolveTheme } from '@/presentation/theme/resolve-theme';

describe('resolveTheme', () => {
  it('honors explicit light and dark preferences', () => {
    expect(resolveTheme('light', 'dark')).toBe('light');
    expect(resolveTheme('dark', 'light')).toBe('dark');
  });

  it('follows the system scheme when preference is auto', () => {
    expect(resolveTheme('auto', 'dark')).toBe('dark');
    expect(resolveTheme('auto', 'light')).toBe('light');
    expect(resolveTheme('auto', null)).toBe('light');
  });
});
