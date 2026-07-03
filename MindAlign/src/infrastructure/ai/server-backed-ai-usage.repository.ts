import type { AiUsageRepository, AiWeekUsage } from '@/application/ports/ai-usage-repository.port';
import type {
  ServerAiQuotaConsumeResult,
  ServerAiQuotaPort,
} from '@/application/ports/server-ai-quota.port';

type StoredUsage = AiWeekUsage & { weekStart: string };

export class MockServerAiQuotaAdapter implements ServerAiQuotaPort {
  private usageByWeek = new Map<string, AiWeekUsage>();

  seedUsage(weekStart: string, usage: AiWeekUsage): void {
    this.usageByWeek.set(weekStart, { ...usage });
  }

  async getUsageForWeek(weekStart: string): Promise<AiWeekUsage> {
    return this.usageByWeek.get(weekStart) ?? { count: 0, bonusCount: 0 };
  }

  async consumeForWeek(input: {
    weekStart: string;
    isPremium: boolean;
    freeWeeklyQuota: number;
    premiumWeeklyQuota: number;
    bonusCount: number;
  }): Promise<ServerAiQuotaConsumeResult> {
    const usage = await this.getUsageForWeek(input.weekStart);
    const limit = input.isPremium
      ? input.premiumWeeklyQuota
      : input.freeWeeklyQuota + usage.bonusCount;

    if (usage.count >= limit) {
      return { allowed: false, reason: 'quota_exceeded' };
    }

    const nextCount = usage.count + 1;
    this.usageByWeek.set(input.weekStart, {
      count: nextCount,
      bonusCount: usage.bonusCount,
    });

    return {
      allowed: true,
      count: nextCount,
      bonusCount: usage.bonusCount,
    };
  }

  async addBonusForWeek(weekStart: string): Promise<number> {
    const usage = await this.getUsageForWeek(weekStart);
    const nextBonus = usage.bonusCount + 1;
    this.usageByWeek.set(weekStart, { ...usage, bonusCount: nextBonus });
    return nextBonus;
  }
}

export class ServerBackedAiUsageRepository implements AiUsageRepository {
  constructor(
    private readonly serverPort: ServerAiQuotaPort,
    private readonly defaults: {
      isPremium: () => Promise<boolean>;
      freeWeeklyQuota: () => Promise<number>;
      premiumWeeklyQuota: () => Promise<number>;
    },
  ) {}

  getUsageForWeek(weekStart: string): Promise<AiWeekUsage> {
    return this.serverPort.getUsageForWeek(weekStart);
  }

  async incrementForWeek(weekStart: string): Promise<number> {
    const [isPremium, usage, freeWeeklyQuota, premiumWeeklyQuota] = await Promise.all([
      this.defaults.isPremium(),
      this.serverPort.getUsageForWeek(weekStart),
      this.defaults.freeWeeklyQuota(),
      this.defaults.premiumWeeklyQuota(),
    ]);

    const result = await this.serverPort.consumeForWeek({
      weekStart,
      isPremium,
      freeWeeklyQuota,
      premiumWeeklyQuota,
      bonusCount: usage.bonusCount,
    });

    if (!result.allowed) {
      throw new Error(`server_quota_${result.reason}`);
    }

    return result.count;
  }

  addBonusForWeek(weekStart: string): Promise<number> {
    return this.serverPort.addBonusForWeek(weekStart);
  }
}

export function mapServerConsumeResult(result: ServerAiQuotaConsumeResult): number {
  if (!result.allowed) {
    throw new Error(`server_quota_${result.reason}`);
  }
  return result.count;
}
