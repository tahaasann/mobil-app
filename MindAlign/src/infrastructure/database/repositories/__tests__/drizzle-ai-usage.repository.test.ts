import { canConsumeAiQuota, getWeekStartUtc, nextAiQuotaCount } from '@/domain/ai/ai-quota';
import { DrizzleAiUsageRepository } from '@/infrastructure/database/repositories/drizzle-ai-usage.repository';

describe('DrizzleAiUsageRepository quota logic', () => {
  it('tracks weekly increments via domain helpers', () => {
    const weekStart = getWeekStartUtc(new Date('2026-06-26T00:00:00.000Z'));
    expect(weekStart).toBe('2026-06-22');
    expect(canConsumeAiQuota(2, 3)).toBe(true);
    expect(nextAiQuotaCount(2)).toBe(3);
    expect(DrizzleAiUsageRepository).toBeDefined();
  });
});
