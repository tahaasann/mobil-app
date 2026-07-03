import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';

import type { AiUsageRepository } from '@/application/ports/ai-usage-repository.port';
import type { RemoteConfigPort } from '@/application/ports/remote-config.port';
import type { SubscriptionPort } from '@/application/ports/subscription.port';
import { HttpServerAiQuotaAdapter } from '@/infrastructure/ai/http-server-ai-quota.adapter';
import { ServerBackedAiUsageRepository } from '@/infrastructure/ai/server-backed-ai-usage.repository';
import { DrizzleAiUsageRepository } from '@/infrastructure/database/repositories/drizzle-ai-usage.repository';

import type * as schema from '@/infrastructure/database/schema';

export function createAiUsageRepository(input: {
  db: ExpoSQLiteDatabase<typeof schema>;
  subscriptionPort: SubscriptionPort;
  remoteConfigPort: RemoteConfigPort;
}): AiUsageRepository {
  const localRepository = new DrizzleAiUsageRepository(input.db);

  if (process.env.EXPO_PUBLIC_SERVER_AI_QUOTA !== 'true') {
    return localRepository;
  }

  const serverPort = new HttpServerAiQuotaAdapter();

  return new ServerBackedAiUsageRepository(serverPort, {
    isPremium: async () => {
      const entitlement = await input.subscriptionPort.getEntitlement();
      return entitlement.isPremium;
    },
    freeWeeklyQuota: async () => {
      const values = await input.remoteConfigPort.getValues();
      return values.freeWeeklyQuota;
    },
    premiumWeeklyQuota: async () => {
      const values = await input.remoteConfigPort.getValues();
      return values.premiumWeeklyQuota;
    },
  });
}
