import type { AiWeekUsage } from '@/application/ports/ai-usage-repository.port';
import type {
  ServerAiQuotaConsumeResult,
  ServerAiQuotaPort,
} from '@/application/ports/server-ai-quota.port';

type QuotaApiResponse =
  | { ok: true; count: number; bonusCount: number }
  | { ok: false; reason: 'quota_exceeded' | 'ai_disabled' | 'unauthenticated' };

export class HttpServerAiQuotaAdapter implements ServerAiQuotaPort {
  constructor(private readonly baseUrl = process.env.EXPO_PUBLIC_AI_QUOTA_BASE_URL?.trim() ?? '') {}

  private ensureConfigured(): void {
    if (!this.baseUrl) {
      throw new Error('EXPO_PUBLIC_AI_QUOTA_BASE_URL is required for server AI quota');
    }
  }

  private async post<T>(path: string, body: Record<string, unknown>): Promise<T> {
    this.ensureConfigured();
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`server_ai_quota_http_${response.status}`);
    }

    return (await response.json()) as T;
  }

  async getUsageForWeek(weekStart: string): Promise<AiWeekUsage> {
    const result = await this.post<{ count: number; bonusCount: number }>('/getUsage', {
      weekStart,
    });
    return { count: result.count, bonusCount: result.bonusCount };
  }

  async consumeForWeek(input: {
    weekStart: string;
    isPremium: boolean;
    freeWeeklyQuota: number;
    premiumWeeklyQuota: number;
    bonusCount: number;
  }): Promise<ServerAiQuotaConsumeResult> {
    const result = await this.post<QuotaApiResponse>('/consume', input);
    if (!result.ok) {
      return { allowed: false, reason: result.reason };
    }
    return {
      allowed: true,
      count: result.count,
      bonusCount: result.bonusCount,
    };
  }

  async addBonusForWeek(weekStart: string): Promise<number> {
    const result = await this.post<{ bonusCount: number }>('/addBonus', { weekStart });
    return result.bonusCount;
  }
}
