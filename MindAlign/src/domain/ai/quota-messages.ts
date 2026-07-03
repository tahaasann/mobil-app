import type { CrisisLocale } from '@/domain/ai/crisis-guardrail';

export function buildWeeklyQuotaExceededMessage(locale: CrisisLocale, limit: number): string {
  if (locale === 'en') {
    return `You've used all ${limit} free coach chats this week. Your quota renews next week.`;
  }

  return `Bu hafta ücretsiz ${limit} AI koçluk hakkını kullandın. Gelecek hafta yenilenir.`;
}
