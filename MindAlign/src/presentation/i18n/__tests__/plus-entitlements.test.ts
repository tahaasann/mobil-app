import en from '@/presentation/i18n/locales/en.json';

describe('plus entitlement messaging (T-221)', () => {
  it('does not sell bookmark sync as a Plus-only benefit', () => {
    expect(en.paywall.subtitle.toLowerCase()).not.toContain('bookmark sync');
  });
});
