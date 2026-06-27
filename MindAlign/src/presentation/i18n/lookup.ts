export type TranslationTree = {
  [key: string]: string | TranslationTree;
};

export function lookupTranslation(tree: TranslationTree, key: string): string | undefined {
  const parts = key.split('.');
  let current: string | TranslationTree | undefined = tree;

  for (const part of parts) {
    if (typeof current !== 'object' || current === null || !(part in current)) {
      return undefined;
    }
    current = current[part];
  }

  return typeof current === 'string' ? current : undefined;
}

export function resolveTranslation(
  key: string,
  locale: string,
  resources: Record<string, TranslationTree>,
  fallbackLocale = 'en',
): string {
  const active = lookupTranslation(resources[locale] ?? {}, key);
  if (active !== undefined) {
    return active;
  }

  if (locale !== fallbackLocale) {
    const fallback = lookupTranslation(resources[fallbackLocale] ?? {}, key);
    if (fallback !== undefined) {
      return fallback;
    }
  }

  return key;
}
