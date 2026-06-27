import { buildCoachPrompt, buildCoachSystemPrompt } from '@/domain/ai/prompt-builder';
import {
  getIslamicPolicyRules,
  promptIncludesIslamicPolicyRules,
} from '@/domain/ai/islamic-content-policy';

describe('prompt builder', () => {
  it('includes habit and excuse in user prompt', () => {
    const { user } = buildCoachPrompt({
      approach: 'scientific',
      habitTitle: 'Meditasyon',
      excuse: 'Zamanım yok',
      streak: 4,
    });

    expect(user).toContain('Meditasyon');
    expect(user).toContain('Zamanım yok');
    expect(user).toContain('Current streak: 4 days.');
  });

  it('adds islamic policy rules for spiritual lens', () => {
    const system = buildCoachSystemPrompt({
      approach: 'spiritual',
      habitTitle: 'Namaz',
      excuse: 'Yorgunum',
      islamicPolicyRules: getIslamicPolicyRules(true),
    });

    expect(promptIncludesIslamicPolicyRules(system)).toBe(true);
  });

  it('includes user profile context in the system prompt', () => {
    const system = buildCoachSystemPrompt({
      approach: 'universal',
      habitTitle: 'Walk',
      excuse: 'Too tired',
      profile: {
        identityGoal: 'An energized parent',
        defaultTone: 'gentle',
        commonBarrier: 'no_time',
      },
    });

    expect(system).toContain('Identity goal: An energized parent');
    expect(system).toContain('Common barrier: no_time');
    expect(system).toContain('warm, validating tone');
  });
});
