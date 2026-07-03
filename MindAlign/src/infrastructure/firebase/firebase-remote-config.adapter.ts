import remoteConfig from '@react-native-firebase/remote-config';

import type { RemoteConfigPort, RemoteConfigValues } from '@/application/ports/remote-config.port';
import { FREE_WEEKLY_AI_QUOTA, PREMIUM_WEEKLY_AI_QUOTA } from '@/domain/ai/ai-quota';
import { GEMINI_LITE_MODEL, GEMINI_MODEL } from '@/infrastructure/firebase/firebase-ai.constants';

export class FirebaseRemoteConfigAdapter implements RemoteConfigPort {
  async configure(): Promise<void> {
    await remoteConfig().setConfigSettings({
      minimumFetchIntervalMillis: __DEV__ ? 0 : 60 * 60 * 1000,
    });
    await remoteConfig().setDefaults({
      free_weekly_quota: FREE_WEEKLY_AI_QUOTA,
      premium_weekly_quota: PREMIUM_WEEKLY_AI_QUOTA,
      gemini_model: GEMINI_MODEL,
      gemini_lite_model: GEMINI_LITE_MODEL,
      ai_enabled: true,
      server_ai_quota_enabled: false,
    });
  }

  async fetchAndActivate(): Promise<void> {
    await remoteConfig().fetchAndActivate();
  }

  async getValues(): Promise<RemoteConfigValues> {
    const config = remoteConfig();

    return {
      freeWeeklyQuota: config.getValue('free_weekly_quota').asNumber(),
      premiumWeeklyQuota: config.getValue('premium_weekly_quota').asNumber(),
      geminiModel: config.getValue('gemini_model').asString(),
      geminiLiteModel: config.getValue('gemini_lite_model').asString(),
      aiEnabled: config.getValue('ai_enabled').asBoolean(),
      serverAiQuotaEnabled: config.getValue('server_ai_quota_enabled').asBoolean(),
    };
  }
}
