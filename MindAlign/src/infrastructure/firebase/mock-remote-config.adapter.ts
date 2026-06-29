import { FREE_WEEKLY_AI_QUOTA, PREMIUM_WEEKLY_AI_QUOTA } from '@/domain/ai/ai-quota';
import { GEMINI_LITE_MODEL, GEMINI_MODEL } from '@/infrastructure/firebase/firebase-ai.constants';
import type { RemoteConfigPort, RemoteConfigValues } from '@/application/ports/remote-config.port';

const DEFAULTS: RemoteConfigValues = {
  freeWeeklyQuota: FREE_WEEKLY_AI_QUOTA,
  premiumWeeklyQuota: PREMIUM_WEEKLY_AI_QUOTA,
  geminiModel: GEMINI_MODEL,
  geminiLiteModel: GEMINI_LITE_MODEL,
};

export class MockRemoteConfigAdapter implements RemoteConfigPort {
  private values = { ...DEFAULTS };

  setValues(values: Partial<RemoteConfigValues>): void {
    this.values = { ...this.values, ...values };
  }

  async configure(): Promise<void> {}

  async fetchAndActivate(): Promise<void> {}

  async getValues(): Promise<RemoteConfigValues> {
    return this.values;
  }
}
