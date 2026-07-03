export type CrisisSupportResponse = {
  kind: 'crisis';
  message: string;
  resources: string[];
};

export type CrisisLocale = 'tr' | 'en';

const VERIFIED_RESOURCES_TR = [
  'Acil tehlike (ambulans, polis, itfaiye): 112',
  'ALO 182 — Çocuk ve Genç İletişim Danışma Hattı (7/24, Türkiye)',
] as const;

const VERIFIED_RESOURCES_EN = [
  'Emergency (ambulance, police, fire): 112',
  'ALO 182 — Child and Youth Helpline (24/7, Türkiye)',
] as const;

const CRISIS_COPY: Record<CrisisLocale, { message: string; resources: readonly string[] }> = {
  tr: {
    message:
      'Şu an çok zor bir an yaşıyor olabilirsin. MindAlign bir tedavi veya kriz hattı değildir; yalnız kalmaman önemli. Acil tehlike varsa 112’yi ara. Lütfen güvendiğin birine ulaş veya aşağıdaki kaynaklardan destek al.',
    resources: VERIFIED_RESOURCES_TR,
  },
  en: {
    message:
      'You may be going through an extremely difficult moment. MindAlign is not therapy or a crisis line; you do not have to face this alone. If you are in immediate danger, call 112. Please reach out to someone you trust or use the resources below.',
    resources: VERIFIED_RESOURCES_EN,
  },
};

const CRISIS_PATTERNS = [
  /\b(intihar|kendimi öldür|ölmek istiyorum|suicide|kill myself)\b/i,
  /\b(kendime zarar|self[- ]harm|canıma kıy)\w*/i,
  /\b(انتحار|أقتل نفسي|أريد أن أموت)\b/i,
  /\b(suicide|me tuer|automutilation)\b/i,
  /\b(自殺|死にたい)\b/i,
];

export function buildCrisisSupportResponse(locale: CrisisLocale = 'tr'): CrisisSupportResponse {
  const copy = CRISIS_COPY[locale] ?? CRISIS_COPY.tr;
  return {
    kind: 'crisis',
    message: copy.message,
    resources: [...copy.resources],
  };
}

export function detectCrisis(text: string): boolean {
  const normalized = text.trim();
  if (!normalized) {
    return false;
  }

  return CRISIS_PATTERNS.some((pattern) => pattern.test(normalized));
}
