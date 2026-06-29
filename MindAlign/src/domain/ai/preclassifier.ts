import { detectCrisis } from '@/domain/ai/crisis-guardrail';

export type PreclassifierResult = 'on_topic' | 'off_topic' | 'crisis';

export const MAX_PRECLASSIFIER_INPUT_LENGTH = 500;

const OFF_TOPIC_PATTERNS = [
  /\b(kod yaz|python|javascript|html|css)\b/i,
  /\b(ödev|homework|essay)\b/i,
  /\b(hava durumu|weather)\b/i,
  /\bignore (previous|all) instructions\b/i,
  /\bönceki talimat/i,
];

export function classifyExcuseText(text: string): PreclassifierResult {
  const normalized = text.trim();
  if (!normalized) {
    return 'off_topic';
  }

  if (detectCrisis(normalized)) {
    return 'crisis';
  }

  if (OFF_TOPIC_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return 'off_topic';
  }

  return 'on_topic';
}
