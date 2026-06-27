export const ISLAMIC_CONTENT_POLICY_RULES = [
  'Quote only well-known general principles; do NOT invent Quran verses or hadith numbers.',
  'Prefer paraphrase over fabricated citations. If unsure, speak in general spiritual terms without fake references.',
  'Stay within habit coaching; do not issue religious rulings (fatwa) or medical claims.',
  'Encourage mercy toward oneself (merhamet) and consistent small steps aligned with intention (niyet).',
];

export function getIslamicPolicyRules(isSpiritualMode: boolean): string[] {
  return isSpiritualMode ? ISLAMIC_CONTENT_POLICY_RULES : [];
}

export function promptIncludesIslamicPolicyRules(prompt: string): boolean {
  return ISLAMIC_CONTENT_POLICY_RULES.every((rule) => prompt.includes(rule));
}
