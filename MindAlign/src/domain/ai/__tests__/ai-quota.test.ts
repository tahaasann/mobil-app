import {
  FREE_WEEKLY_AI_QUOTA,
  PREMIUM_WEEKLY_AI_QUOTA,
  canConsumeAiQuota,
  getWeekStartUtc,
  nextAiQuotaCount,
  resolveWeeklyQuotaLimit,
} from '@/domain/ai/ai-quota';

describe('ai quota', () => {
  it('computes monday-based week start in UTC', () => {
    expect(getWeekStartUtc(new Date('2026-06-25T12:00:00.000Z'))).toBe('2026-06-22');
  });

  it('allows consumption below free weekly limit', () => {
    expect(canConsumeAiQuota(0, FREE_WEEKLY_AI_QUOTA)).toBe(true);
    expect(canConsumeAiQuota(FREE_WEEKLY_AI_QUOTA - 1, FREE_WEEKLY_AI_QUOTA)).toBe(true);
    expect(canConsumeAiQuota(FREE_WEEKLY_AI_QUOTA, FREE_WEEKLY_AI_QUOTA)).toBe(false);
  });

  it('increments count', () => {
    expect(nextAiQuotaCount(2)).toBe(3);
  });

  it('extends free quota with rewarded bonus', () => {
    expect(resolveWeeklyQuotaLimit({ isPremium: false, bonusCount: 1 })).toBe(4);
    expect(canConsumeAiQuota(3, resolveWeeklyQuotaLimit({ isPremium: false, bonusCount: 1 }))).toBe(
      true,
    );
  });

  it('uses premium fair-use cap', () => {
    expect(resolveWeeklyQuotaLimit({ isPremium: true })).toBe(PREMIUM_WEEKLY_AI_QUOTA);
    expect(canConsumeAiQuota(59, PREMIUM_WEEKLY_AI_QUOTA)).toBe(true);
    expect(canConsumeAiQuota(60, PREMIUM_WEEKLY_AI_QUOTA)).toBe(false);
  });
});
