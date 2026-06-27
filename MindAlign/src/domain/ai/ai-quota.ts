export const FREE_WEEKLY_AI_QUOTA = 3;

export function getWeekStartUtc(date: Date): string {
  const utc = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = utc.getUTCDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  utc.setUTCDate(utc.getUTCDate() + diffToMonday);
  return utc.toISOString().slice(0, 10);
}

export function canConsumeAiQuota(currentCount: number, limit = FREE_WEEKLY_AI_QUOTA): boolean {
  return currentCount < limit;
}

export function nextAiQuotaCount(currentCount: number): number {
  return currentCount + 1;
}
