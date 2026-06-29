import type { AppMetaRepository } from '@/application/ports/app-meta-repository.port';
import type { AuthUser } from '@/application/ports/auth.port';
import type { NotificationPort } from '@/application/ports/notification.port';
import type { SubscriptionPort } from '@/application/ports/subscription.port';
import type { UserDataPort } from '@/application/ports/user-data.port';

import type { SyncOnLoginUseCase } from './sync-on-login.use-case';

export const ACTIVE_AUTH_USER_ID_KEY = 'active_auth_user_id';

export class HandleAuthSessionUseCase {
  constructor(
    private readonly appMetaRepository: AppMetaRepository,
    private readonly userDataPort: UserDataPort,
    private readonly notificationPort: NotificationPort,
    private readonly syncOnLoginUseCase: SyncOnLoginUseCase,
    private readonly subscriptionPort: SubscriptionPort,
  ) {}

  async execute(user: AuthUser): Promise<void> {
    const previousUserId = await this.appMetaRepository.get(ACTIVE_AUTH_USER_ID_KEY);

    if (previousUserId && previousUserId !== user.id) {
      await this.notificationPort.cancelAll();
      await this.userDataPort.clearSessionData();
    }

    await this.appMetaRepository.set(ACTIVE_AUTH_USER_ID_KEY, user.id);
    await this.subscriptionPort.identifyUser(user.id);

    if (user.isAnonymous) {
      return;
    }

    await this.syncOnLoginUseCase.execute(user.id);
  }
}

export class SignOutSessionUseCase {
  constructor(
    private readonly userDataPort: UserDataPort,
    private readonly notificationPort: NotificationPort,
    private readonly subscriptionPort: SubscriptionPort,
    private readonly appMetaRepository: AppMetaRepository,
  ) {}

  async execute(): Promise<void> {
    await this.notificationPort.cancelAll();
    await this.userDataPort.clearSessionData();
    await this.appMetaRepository.set(ACTIVE_AUTH_USER_ID_KEY, '');
    await this.subscriptionPort.identifyUser(null);
  }
}
