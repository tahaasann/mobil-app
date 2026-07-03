import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { useTranslation } from 'react-i18next';

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

  it('renders English copy when locale is en', async () => {
    await render(
      <I18nProvider locale="en">
        <LocaleProbe />
      </I18nProvider>,
    );

    expect(screen.getByText('Your habits today')).toBeOnTheScreen();
  });
});
