import type { ApproachLens } from '@/application/ports/ai-coach.port';
import type { AppSettingsRepository } from '@/application/ports/app-settings-repository.port';
import type { UserProfileRepository } from '@/application/ports/user-profile-repository.port';
import { upsertAppSettings } from '@/domain/entities/app-settings';
import type { CoachTone } from '@/domain/entities/user-profile';
import { upsertUserProfile } from '@/domain/entities/user-profile';
import type { AppLocale } from '@/presentation/i18n';
import type { ThemePreference } from '@/presentation/theme/resolve-theme';

import type { CreateHabitUseCase } from './create-habit.use-case';

export type SaveOnboardingInput = {
  approach: ApproachLens;
  language: AppLocale;
  theme: ThemePreference;
  identityGoal?: string;
  defaultTone: CoachTone;
  commonBarrier?: string;
  notifWindow?: string | null;
  notifFrequency?: number | null;
  habitTitles: string[];
};

export class SaveOnboardingUseCase {
  constructor(
    private readonly settingsRepository: AppSettingsRepository,
    private readonly userProfileRepository: UserProfileRepository,
    private readonly createHabitUseCase: CreateHabitUseCase,
  ) {}

  async execute(input: SaveOnboardingInput): Promise<void> {
    const profile = upsertUserProfile(await this.userProfileRepository.get(), {
      identityGoal: input.identityGoal,
      defaultTone: input.defaultTone,
      commonBarrier: input.commonBarrier,
      notifWindow: input.notifWindow,
      notifFrequency: input.notifFrequency,
    });
    await this.userProfileRepository.save(profile);

    for (const title of input.habitTitles) {
      const trimmed = title.trim();
      if (trimmed) {
        await this.createHabitUseCase.execute({ title: trimmed });
      }
    }

    const settings = upsertAppSettings(await this.settingsRepository.get(), {
      selectedApproach: input.approach,
      language: input.language,
      theme: input.theme,
      onboardingCompleted: true,
    });
    await this.settingsRepository.save(settings);
  }
}
