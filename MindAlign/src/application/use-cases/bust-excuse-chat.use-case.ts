import type {
  AiCoachPort,
  ApproachLens,
  BarrierResponse,
  CoachProfileContext,
  CoachStreamHandler,
  CoachTurn,
} from '@/application/ports/ai-coach.port';
import type { AiUsageRepository } from '@/application/ports/ai-usage-repository.port';
import type { RemoteConfigPort } from '@/application/ports/remote-config.port';
import type { SubscriptionPort } from '@/application/ports/subscription.port';
import { canConsumeAiQuota, getWeekStartUtc, resolveWeeklyQuotaLimit } from '@/domain/ai/ai-quota';
import { resolveRemoteConfigModels } from '@/domain/ai/remote-config-policy';
import { buildCrisisSupportResponse, type CrisisLocale } from '@/domain/ai/crisis-guardrail';
import { scanCoachOutput } from '@/domain/ai/output-guardrail';
import { buildWeeklyQuotaExceededMessage } from '@/domain/ai/quota-messages';
import { classifyExcuseText } from '@/domain/ai/preclassifier';

export type BustExcuseChatInput = {
  habitTitle: string;
  excuse: string;
  approach: ApproachLens;
  streak?: number;
  profile?: CoachProfileContext;
  locale?: CrisisLocale;
  conversationHistory?: CoachTurn[];
  onPartial?: CoachStreamHandler;
};

export type BustExcuseChatResult =
  | { kind: 'coach'; response: BarrierResponse }
  | { kind: 'crisis'; message: string; resources: string[] }
  | { kind: 'off_topic'; message: string }
  | { kind: 'quota_exceeded'; message: string };

const OFF_TOPIC_MESSAGE =
  'MindAlign yalnızca alışkanlık ve bahane koçluğu için tasarlandı. Lütfen bugün takıldığın alışkanlıkla ilgili bir cümle yaz.';

const AI_DISABLED_MESSAGE = 'AI koçluk geçici olarak devre dışı. Lütfen daha sonra tekrar dene.';

export class BustExcuseChatUseCase {
  constructor(
    private readonly aiCoach: AiCoachPort,
    private readonly aiUsageRepository: AiUsageRepository,
    private readonly subscriptionPort: SubscriptionPort,
    private readonly remoteConfigPort: RemoteConfigPort,
  ) {}

  async execute(input: BustExcuseChatInput): Promise<BustExcuseChatResult> {
    const classification = classifyExcuseText(input.excuse);
    if (classification === 'crisis') {
      const crisis = buildCrisisSupportResponse(input.locale ?? 'tr');
      return { kind: 'crisis', message: crisis.message, resources: crisis.resources };
    }

    if (classification === 'off_topic') {
      return { kind: 'off_topic', message: OFF_TOPIC_MESSAGE };
    }

    const weekStart = getWeekStartUtc(new Date());
    const [{ isPremium }, usage, remoteConfig] = await Promise.all([
      this.subscriptionPort.getEntitlement(),
      this.aiUsageRepository.getUsageForWeek(weekStart),
      this.remoteConfigPort.getValues(),
    ]);

    if (!remoteConfig.aiEnabled) {
      return {
        kind: 'quota_exceeded',
        message: AI_DISABLED_MESSAGE,
      };
    }

    const models = resolveRemoteConfigModels(remoteConfig);
    const limit = resolveWeeklyQuotaLimit({
      isPremium,
      bonusCount: usage.bonusCount,
      freeWeeklyQuota: remoteConfig.freeWeeklyQuota,
      premiumWeeklyQuota: remoteConfig.premiumWeeklyQuota,
    });

    if (!canConsumeAiQuota(usage.count, limit)) {
      return {
        kind: 'quota_exceeded',
        message: buildWeeklyQuotaExceededMessage(input.locale ?? 'tr', limit),
      };
    }

    const response = await this.aiCoach.generateCoachResponse(
      {
        habitTitle: input.habitTitle,
        excuse: input.excuse,
        approach: input.approach,
        streak: input.streak,
        profile: input.profile,
        geminiModel: models.geminiModel,
        geminiLiteModel: models.geminiLiteModel,
        responseLanguage: input.locale ?? 'tr',
        conversationHistory: input.conversationHistory,
      },
      input.onPartial,
    );

    const guard = scanCoachOutput(response);
    if (!guard.safe) {
      if (guard.reason === 'crisis') {
        const crisis = buildCrisisSupportResponse(input.locale ?? 'tr');
        return { kind: 'crisis', message: crisis.message, resources: crisis.resources };
      }
      return { kind: 'off_topic', message: OFF_TOPIC_MESSAGE };
    }

    await this.aiUsageRepository.incrementForWeek(weekStart);

    return { kind: 'coach', response };
  }
}
