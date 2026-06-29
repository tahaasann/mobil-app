import type { AppMetaRepository } from '@/application/ports/app-meta-repository.port';
import type { ReviewPort } from '@/application/ports/review.port';
import type { NotificationPort } from '@/application/ports/notification.port';
import type { UserDataPort } from '@/application/ports/user-data.port';
import type { AppSettingsRepository } from '@/application/ports/app-settings-repository.port';
import { upsertAppSettings } from '@/domain/entities/app-settings';
import type { UpsertAppSettingsInput } from '@/domain/entities/app-settings';
import type { UserProfileRepository } from '@/application/ports/user-profile-repository.port';
import { upsertUserProfile } from '@/domain/entities/user-profile';
import type { UpsertUserProfileInput } from '@/domain/entities/user-profile';

const REVIEW_PROMPT_KEY = 'review_prompt_shown';

export class ExportUserDataUseCase {
  constructor(private readonly userDataPort: UserDataPort) {}

  async execute(): Promise<string> {
    const snapshot = await this.userDataPort.exportSnapshot();
    return JSON.stringify(snapshot, null, 2);
  }
}

export class ResetUserDataUseCase {
  constructor(
    private readonly userDataPort: UserDataPort,
    private readonly notificationPort: NotificationPort,
  ) {}

  async execute(): Promise<void> {
    await this.notificationPort.cancelAll();
    await this.userDataPort.resetAll();
  }
}

export class UpdateAppSettingsUseCase {
  constructor(private readonly settingsRepository: AppSettingsRepository) {}

  async execute(input: UpsertAppSettingsInput): Promise<void> {
    const current = await this.settingsRepository.get();
    await this.settingsRepository.save(upsertAppSettings(current, input));
  }
}

export class UpdateUserProfileUseCase {
  constructor(private readonly userProfileRepository: UserProfileRepository) {}

  async execute(input: UpsertUserProfileInput): Promise<void> {
    const current = await this.userProfileRepository.get();
    await this.userProfileRepository.save(upsertUserProfile(current, input));
  }
}

export class RequestReviewAfterRescueUseCase {
  constructor(
    private readonly reviewPort: ReviewPort,
    private readonly appMetaRepository: AppMetaRepository,
  ) {}

  async execute(): Promise<'requested' | 'skipped'> {
    const alreadyShown = await this.appMetaRepository.get(REVIEW_PROMPT_KEY);
    if (alreadyShown === 'true') {
      return 'skipped';
    }

    const available = await this.reviewPort.isAvailable();
    if (!available) {
      return 'skipped';
    }

    await this.reviewPort.requestReview();
    await this.appMetaRepository.set(REVIEW_PROMPT_KEY, 'true');
    return 'requested';
  }
}
