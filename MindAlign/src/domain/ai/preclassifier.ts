export type PreclassifierResult = 'on_topic' | 'off_topic' | 'crisis';

const OFF_TOPIC_PATTERNS = [
  /\b(kod yaz|python|javascript|html|css)\b/i,
  /\b(ödev|homework|essay)\b/i,
  /\b(hava durumu|weather)\b/i,
  /\bignore (previous|all) instructions\b/i,
  /\bönceki talimat/i,
];

const CRISIS_PATTERNS = [
  /\b(intihar|kendimi öldür|ölmek istiyorum|suicide|kill myself)\b/i,
  /\b(kendime zarar|self[- ]harm|canıma kıy)\b/i,
];

export function classifyExcuseText(text: string): PreclassifierResult {
  const normalized = text.trim();
  if (!normalized) {
    return 'off_topic';
  }

  if (CRISIS_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return 'crisis';
  }

  if (OFF_TOPIC_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return 'off_topic';
  }

  return 'on_topic';
}
