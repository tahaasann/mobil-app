import {
  FREE_WEEKLY_AI_QUOTA,
  canConsumeAiQuota,
  getWeekStartUtc,
  nextAiQuotaCount,
} from '@/domain/ai/ai-quota';

describe('ai quota', () => {
  it('computes monday-based week start in UTC', () => {
    expect(getWeekStartUtc(new Date('2026-06-25T12:00:00.000Z'))).toBe('2026-06-22');
  });

  it('allows consumption below free weekly limit', () => {
    expect(canConsumeAiQuota(0)).toBe(true);
    expect(canConsumeAiQuota(FREE_WEEKLY_AI_QUOTA - 1)).toBe(true);
    expect(canConsumeAiQuota(FREE_WEEKLY_AI_QUOTA)).toBe(false);
  });

  it('increments count', () => {
    expect(nextAiQuotaCount(2)).toBe(3);
  });
});
