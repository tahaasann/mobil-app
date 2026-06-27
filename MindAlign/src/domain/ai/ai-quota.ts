export const FREE_WEEKLY_AI_QUOTA = 3;
export const PREMIUM_WEEKLY_AI_QUOTA = 60;

export function getWeekStartUtc(date: Date): string {
  const utc = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = utc.getUTCDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  utc.setUTCDate(utc.getUTCDate() + diffToMonday);
  return utc.toISOString().slice(0, 10);
}

export function resolveWeeklyQuotaLimit(input: {
  isPremium: boolean;
  bonusCount?: number;
  freeWeeklyQuota?: number;
  premiumWeeklyQuota?: number;
}): number {
  if (input.isPremium) {
    return input.premiumWeeklyQuota ?? PREMIUM_WEEKLY_AI_QUOTA;
  }

  return (input.freeWeeklyQuota ?? FREE_WEEKLY_AI_QUOTA) + (input.bonusCount ?? 0);
}

export function canConsumeAiQuota(currentCount: number, limit: number): boolean {
  return currentCount < limit;
}

export function nextAiQuotaCount(currentCount: number): number {
  return currentCount + 1;
}
