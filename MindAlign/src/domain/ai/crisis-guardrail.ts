export type CrisisSupportResponse = {
  kind: 'crisis';
  message: string;
  resources: string[];
};

const DEFAULT_RESOURCES = [
  'Türkiye: ALİZE Çocuk ve Genç İletişim Hattı 182',
  'Türkiye: Sağlık Bakanlığı ALO 182 psikososyal destek',
  'Acil durum: 112',
];

export function buildCrisisSupportResponse(): CrisisSupportResponse {
  return {
    kind: 'crisis',
    message:
      'Şu an çok zor bir an yaşıyor olabilirsin. MindAlign bir tedavi veya kriz hattı değildir; yalnız kalmaman önemli. Lütfen güvendiğin birine ulaş veya aşağıdaki kaynaklardan destek al.',
    resources: DEFAULT_RESOURCES,
  };
}

const CRISIS_PATTERNS = [
  /\b(intihar|kendimi öldür|ölmek istiyorum|suicide|kill myself)\b/i,
  /\b(kendime zarar|self[- ]harm|canıma kıy)\w*/i,
];

export function detectCrisis(text: string): boolean {
  const normalized = text.trim();
  if (!normalized) {
    return false;
  }

  return CRISIS_PATTERNS.some((pattern) => pattern.test(normalized));
}
