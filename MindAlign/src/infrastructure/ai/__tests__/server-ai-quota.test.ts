import { MockServerAiQuotaAdapter } from '@/infrastructure/ai/server-backed-ai-usage.repository';

describe('MockServerAiQuotaAdapter', () => {
  it('consumes quota atomically until limit is reached', async () => {
    const adapter = new MockServerAiQuotaAdapter();
    const weekStart = '2026-06-29';

    await expect(
      adapter.consumeForWeek({
        weekStart,
        isPremium: false,
        freeWeeklyQuota: 2,
        premiumWeeklyQuota: 60,
        bonusCount: 0,
      }),
    ).resolves.toEqual({ allowed: true, count: 1, bonusCount: 0 });

    await expect(
      adapter.consumeForWeek({
        weekStart,
        isPremium: false,
        freeWeeklyQuota: 2,
        premiumWeeklyQuota: 60,
        bonusCount: 0,
      }),
    ).resolves.toEqual({ allowed: true, count: 2, bonusCount: 0 });

    await expect(
      adapter.consumeForWeek({
        weekStart,
        isPremium: false,
        freeWeeklyQuota: 2,
        premiumWeeklyQuota: 60,
        bonusCount: 0,
      }),
    ).resolves.toEqual({ allowed: false, reason: 'quota_exceeded' });
  });

  it('adds rewarded bonus for the week', async () => {
    const adapter = new MockServerAiQuotaAdapter();
    const weekStart = '2026-06-29';

    await expect(adapter.addBonusForWeek(weekStart)).resolves.toBe(1);
    await expect(adapter.getUsageForWeek(weekStart)).resolves.toEqual({
      count: 0,
      bonusCount: 1,
    });
  });
});
