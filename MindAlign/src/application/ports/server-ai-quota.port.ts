import type { AiWeekUsage } from '@/application/ports/ai-usage-repository.port';

export type ServerAiQuotaConsumeResult =
  | { allowed: true; count: number; bonusCount: number }
  | { allowed: false; reason: 'quota_exceeded' | 'ai_disabled' | 'unauthenticated' };

export type ServerAiQuotaPort = {
  getUsageForWeek(weekStart: string): Promise<AiWeekUsage>;
  consumeForWeek(input: {
    weekStart: string;
    isPremium: boolean;
    freeWeeklyQuota: number;
    premiumWeeklyQuota: number;
    bonusCount: number;
  }): Promise<ServerAiQuotaConsumeResult>;
  addBonusForWeek(weekStart: string): Promise<number>;
};
