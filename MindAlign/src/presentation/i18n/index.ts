import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import en from './locales/en.json';
import tr from './locales/tr.json';

export const SUPPORTED_LOCALES = ['en', 'tr'] as const;
export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

export const RTL_LOCALES: AppLocale[] = [];

const resources = {
  en: { translation: en },
  tr: { translation: tr },
};

function resolveDeviceLocale(): AppLocale {
  const device = Localization.getLocales()[0]?.languageCode ?? 'en';
  if (SUPPORTED_LOCALES.includes(device as AppLocale)) {
    return device as AppLocale;
  }
  return 'en';
}

let initialized = false;

export function initI18n(locale?: AppLocale): typeof i18n {
  if (initialized) {
    if (locale && i18n.language !== locale) {
      void i18n.changeLanguage(locale);
    }
    return i18n;
  }

  void i18n.use(initReactI18next).init({
    resources,
    lng: locale ?? resolveDeviceLocale(),
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    compatibilityJSON: 'v4',
  });

  initialized = true;
  return i18n;
}

export function isRtlLocale(locale: string): boolean {
  return RTL_LOCALES.includes(locale as AppLocale);
}

export { i18n };
