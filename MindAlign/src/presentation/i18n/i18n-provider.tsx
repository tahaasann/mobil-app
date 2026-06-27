import { useEffect, type ReactNode } from 'react';
import { I18nextProvider, useTranslation } from 'react-i18next';
import { I18nManager } from 'react-native';

import { initI18n, isRtlLocale, type AppLocale } from '@/presentation/i18n';

type I18nProviderProps = {
  children: ReactNode;
  locale?: AppLocale;
};

function RtlSync({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();

  useEffect(() => {
    const shouldUseRtl = isRtlLocale(i18n.language);
    if (I18nManager.isRTL !== shouldUseRtl) {
      I18nManager.allowRTL(shouldUseRtl);
      I18nManager.forceRTL(shouldUseRtl);
    }
  }, [i18n.language]);

  return children;
}

export function I18nProvider({ children, locale }: I18nProviderProps) {
  const instance = initI18n(locale);

  return (
    <I18nextProvider i18n={instance}>
      <RtlSync>{children}</RtlSync>
    </I18nextProvider>
  );
}
