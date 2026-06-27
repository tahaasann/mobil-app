import {
  ISLAMIC_CONTENT_POLICY_RULES,
  getIslamicPolicyRules,
  promptIncludesIslamicPolicyRules,
} from '@/domain/ai/islamic-content-policy';
import { buildCoachSystemPrompt } from '@/domain/ai/prompt-builder';

describe('islamic content policy', () => {
  it('returns rules only in spiritual mode', () => {
    expect(getIslamicPolicyRules(false)).toEqual([]);
    expect(getIslamicPolicyRules(true)).toEqual(ISLAMIC_CONTENT_POLICY_RULES);
  });

  it('injects all policy rules into spiritual system prompt', () => {
    const prompt = buildCoachSystemPrompt({
      approach: 'spiritual',
      habitTitle: "Kur'an",
      excuse: 'Yorgunum',
      islamicPolicyRules: getIslamicPolicyRules(true),
    });

    expect(promptIncludesIslamicPolicyRules(prompt)).toBe(true);
  });
});
