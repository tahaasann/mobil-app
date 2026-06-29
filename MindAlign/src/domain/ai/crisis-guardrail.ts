export type CrisisSupportResponse = {
  kind: 'crisis';
  message: string;
  resources: string[];
};

const DEFAULT_RESOURCES = [
  'Acil tehlike: 112 (Türkiye)',
  'Türkiye: ALİZE Çocuk ve Genç İletişim Hattı 182',
  'Türkiye: MHRS 182 (rANDevu / yönlendirme — psikolojik acil hat değildir)',
];

const CRISIS_PATTERNS = [
  /\b(intihar|kendimi öldür|ölmek istiyorum|suicide|kill myself)\b/i,
  /\b(kendime zarar|self[- ]harm|canıma kıy)\w*/i,
  /\b(انتحار|أقتل نفسي|أريد أن أموت)\b/i,
  /\b(suicide|me tuer|automutilation)\b/i,
  /\b(自殺|死にたい)\b/i,
];

export function buildCrisisSupportResponse(): CrisisSupportResponse {
  return {
    kind: 'crisis',
    message:
      'Şu an çok zor bir an yaşıyor olabilirsin. MindAlign bir tedavi veya kriz hattı değildir; yalnız kalmaman önemli. Acil tehlike varsa 112’yi ara. Lütfen güvendiğin birine ulaş veya aşağıdaki kaynaklardan destek al.',
    resources: DEFAULT_RESOURCES,
  };
}

export function detectCrisis(text: string): boolean {
  const normalized = text.trim();
  if (!normalized) {
    return false;
  }

  return CRISIS_PATTERNS.some((pattern) => pattern.test(normalized));
}
