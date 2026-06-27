import { render, screen, waitFor } from '@testing-library/react-native';
import { Text, I18nManager } from 'react-native';
import { useTranslation } from 'react-i18next';

import { isRtlLocale } from '@/presentation/i18n';
import { I18nProvider } from '@/presentation/i18n/i18n-provider';

function LocaleProbe() {
  const { t } = useTranslation();
  return <Text>{t('dashboard.subtitle')}</Text>;
}

describe('i18n provider', () => {
  it('renders Turkish copy when locale is tr', async () => {
    await render(
      <I18nProvider locale="tr">
        <LocaleProbe />
      </I18nProvider>,
    );

    expect(screen.getByText('Bugünkü alışkanlıkların')).toBeOnTheScreen();
  });

  it('marks Arabic as an RTL locale', () => {
    expect(isRtlLocale('ar')).toBe(true);
    expect(isRtlLocale('en')).toBe(false);
  });

  it('enables RTL layout for Arabic', async () => {
    const forceRtl = jest.spyOn(I18nManager, 'forceRTL').mockImplementation(() => {});

    await render(
      <I18nProvider locale="ar">
        <LocaleProbe />
      </I18nProvider>,
    );

    await waitFor(() => {
      expect(forceRtl).toHaveBeenCalledWith(true);
    });
    expect(screen.getByText('عاداتك اليوم')).toBeOnTheScreen();

    forceRtl.mockRestore();
  });
});
