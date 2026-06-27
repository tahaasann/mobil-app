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

export function detectCrisis(text: string): boolean {
  return /\b(intihar|kendimi öldür|ölmek istiyorum|suicide|kill myself|kendime zarar|self[- ]harm)\b/i.test(
    text,
  );
}
