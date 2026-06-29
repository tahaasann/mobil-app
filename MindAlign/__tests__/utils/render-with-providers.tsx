import { render, type RenderOptions } from '@testing-library/react-native';
import type { ReactElement, ReactNode } from 'react';

import type { AppLocale } from '@/presentation/i18n';
import { I18nProvider } from '@/presentation/i18n/i18n-provider';
import { AppThemeProvider } from '@/presentation/theme/theme-provider';
import type { ThemePreference } from '@/presentation/theme/resolve-theme';

type RenderWithProvidersOptions = Omit<RenderOptions, 'wrapper'> & {
  locale?: AppLocale;
  theme?: ThemePreference;
};

function Providers({
  children,
  locale,
  theme,
}: {
  children: ReactNode;
  locale: AppLocale;
  theme: ThemePreference;
}) {
  return (
    <I18nProvider locale={locale}>
      <AppThemeProvider initialPreference={theme}>{children}</AppThemeProvider>
    </I18nProvider>
  );
}

export async function renderWithProviders(
  ui: ReactElement,
  { locale = 'tr', theme = 'light', ...options }: RenderWithProvidersOptions = {},
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <Providers locale={locale} theme={theme}>
        {children}
      </Providers>
    ),
    ...options,
  });
}
