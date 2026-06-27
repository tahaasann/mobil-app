import type {
  AiCoachPort,
  ApproachLens,
  BarrierResponse,
  CoachProfileContext,
  CoachStreamHandler,
} from '@/application/ports/ai-coach.port';
import type { AiUsageRepository } from '@/application/ports/ai-usage-repository.port';
import type { RemoteConfigPort } from '@/application/ports/remote-config.port';
import type { SubscriptionPort } from '@/application/ports/subscription.port';
import { canConsumeAiQuota, getWeekStartUtc, resolveWeeklyQuotaLimit } from '@/domain/ai/ai-quota';
import { buildCrisisSupportResponse } from '@/domain/ai/crisis-guardrail';
import { classifyExcuseText } from '@/domain/ai/preclassifier';

export type BustExcuseChatInput = {
  habitTitle: string;
  excuse: string;
  approach: ApproachLens;
  streak?: number;
  profile?: CoachProfileContext;
  onPartial?: CoachStreamHandler;
};

export type BustExcuseChatResult =
  | { kind: 'coach'; response: BarrierResponse }
  | { kind: 'crisis'; message: string; resources: string[] }
  | { kind: 'off_topic'; message: string }
  | { kind: 'quota_exceeded'; message: string };

const OFF_TOPIC_MESSAGE =
  'MindAlign yalnızca alışkanlık ve bahane koçluğu için tasarlandı. Lütfen bugün takıldığın alışkanlıkla ilgili bir cümle yaz.';

export class BustExcuseChatUseCase {
  constructor(
    private readonly aiCoach: AiCoachPort,
    private readonly aiUsageRepository: AiUsageRepository,
    private readonly subscriptionPort: SubscriptionPort,
    private readonly remoteConfigPort: RemoteConfigPort,
  ) {}

  async execute(input: BustExcuseChatInput): Promise<BustExcuseChatResult> {
    const weekStart = getWeekStartUtc(new Date());
    const [{ isPremium }, usage, remoteConfig] = await Promise.all([
      this.subscriptionPort.getEntitlement(),
      this.aiUsageRepository.getUsageForWeek(weekStart),
      this.remoteConfigPort.getValues(),
    ]);
    const limit = resolveWeeklyQuotaLimit({
      isPremium,
      bonusCount: usage.bonusCount,
      freeWeeklyQuota: remoteConfig.freeWeeklyQuota,
      premiumWeeklyQuota: remoteConfig.premiumWeeklyQuota,
    });

    if (!canConsumeAiQuota(usage.count, limit)) {
      return {
        kind: 'quota_exceeded',
        message: 'Bu hafta ücretsiz 3 AI koçluk hakkını kullandın. Gelecek hafta yenilenir.',
      };
    }

    const classification = classifyExcuseText(input.excuse);
    if (classification === 'crisis') {
      const crisis = buildCrisisSupportResponse();
      return { kind: 'crisis', message: crisis.message, resources: crisis.resources };
    }

    if (classification === 'off_topic') {
      return { kind: 'off_topic', message: OFF_TOPIC_MESSAGE };
    }

    const response = await this.aiCoach.generateCoachResponse(
      {
        habitTitle: input.habitTitle,
        excuse: input.excuse,
        approach: input.approach,
        streak: input.streak,
        profile: input.profile,
      },
      input.onPartial,
    );

    await this.aiUsageRepository.incrementForWeek(weekStart);

    return { kind: 'coach', response };
  }
}
