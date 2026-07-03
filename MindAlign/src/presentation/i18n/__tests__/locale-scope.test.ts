import { SUPPORTED_LOCALES } from '@/presentation/i18n';

describe('locale scope (T-229/T-230)', () => {
  it('exposes only en and tr for production launch', () => {
    expect(SUPPORTED_LOCALES).toEqual(['en', 'tr']);
  });
});
