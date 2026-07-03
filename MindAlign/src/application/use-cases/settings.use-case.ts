import type { AppMetaRepository } from '@/application/ports/app-meta-repository.port';
import type { AuthPort, AuthUser } from '@/application/ports/auth.port';
import type { NotificationPort } from '@/application/ports/notification.port';
import type { ReviewPort } from '@/application/ports/review.port';
import type { SyncOutboxRepository } from '@/application/ports/sync-outbox.port';
import type { SyncPort } from '@/application/ports/sync.port';
import type { UserDataPort } from '@/application/ports/user-data.port';
import type { AppSettingsRepository } from '@/application/ports/app-settings-repository.port';
import { upsertAppSettings } from '@/domain/entities/app-settings';
import type { UpsertAppSettingsInput } from '@/domain/entities/app-settings';
import type { UserProfileRepository } from '@/application/ports/user-profile-repository.port';
import { upsertUserProfile } from '@/domain/entities/user-profile';
import type { UpsertUserProfileInput } from '@/domain/entities/user-profile';
import {
  ACTIVE_AUTH_IS_ANONYMOUS_KEY,
  ACTIVE_AUTH_USER_ID_KEY,
} from '@/application/use-cases/auth-session.use-case';

const REVIEW_PROMPT_KEY = 'review_prompt_shown';
const RESCUE_COUNT_KEY = 'successful_rescue_count';
const MIN_RESCUES_FOR_REVIEW = 3;

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
    private readonly syncPort: SyncPort,
    private readonly syncOutboxRepository: SyncOutboxRepository,
    private readonly appMetaRepository: AppMetaRepository,
    private readonly authPort: AuthPort,
  ) {}

  async execute(user: AuthUser | null): Promise<void> {
    await this.notificationPort.cancelAll();

    if (user && !user.isAnonymous) {
      await this.syncPort.deleteAllUserData(user.id);
      await this.syncOutboxRepository.clear(user.id);
      await this.authPort.deleteAccount();
    }

    await this.userDataPort.resetAll();
    await this.appMetaRepository.set(ACTIVE_AUTH_USER_ID_KEY, '');
    await this.appMetaRepository.set(ACTIVE_AUTH_IS_ANONYMOUS_KEY, '');
  }
}

export class UpdateAppSettingsUseCase {
  constructor(private readonly settingsRepository: AppSettingsRepository) {}

  async execute(input: UpsertAppSettingsInput): Promise<void> {
    const current = await this.settingsRepository.get();
    await this.settingsRepository.save(upsertAppSettings(current, input));
  }
}

export class ReplayOnboardingUseCase {
  constructor(private readonly settingsRepository: AppSettingsRepository) {}

  async execute(): Promise<void> {
    const current = await this.settingsRepository.get();
    if (!current) {
      throw new Error('settings_not_found');
    }

    await this.settingsRepository.save(
      upsertAppSettings(current, {
        selectedApproach: current.selectedApproach,
        language: current.language,
        theme: current.theme,
        onboardingCompleted: false,
      }),
    );
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
    const rescueCount = Number((await this.appMetaRepository.get(RESCUE_COUNT_KEY)) ?? '0') + 1;
    await this.appMetaRepository.set(RESCUE_COUNT_KEY, String(rescueCount));

    const alreadyShown = await this.appMetaRepository.get(REVIEW_PROMPT_KEY);
    if (alreadyShown === 'true') {
      return 'skipped';
    }

    if (rescueCount < MIN_RESCUES_FOR_REVIEW) {
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
