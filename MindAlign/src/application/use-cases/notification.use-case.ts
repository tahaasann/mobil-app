import type { NotificationPort } from '@/application/ports/notification.port';
import type { HabitRepository } from '@/application/ports/habit-repository.port';
import type { UserProfileRepository } from '@/application/ports/user-profile-repository.port';
import type { Habit } from '@/domain/entities/habit';
import type { UserProfile } from '@/domain/entities/user-profile';
import { buildExcuseDeeplink } from '@/domain/notifications/notification-deeplink';
import {
  buildNotificationIdentifier,
  buildNotificationSchedule,
  type NotificationKind,
} from '@/domain/notifications/notification-schedule';

export type NotificationContentBuilder = (input: {
  kind: NotificationKind;
  habitTitle: string;
}) => {
  title: string;
  body: string;
};

export class ScheduleHabitNotificationsUseCase {
  constructor(private readonly notificationPort: NotificationPort) {}

  async execute(input: {
    habit: Habit;
    profile: UserProfile | null;
    content: NotificationContentBuilder;
  }): Promise<void> {
    const slots = buildNotificationSchedule({
      notifWindow: input.profile?.notifWindow ?? null,
      notifFrequency: input.profile?.notifFrequency ?? null,
    });

    if (slots.length === 0) {
      return;
    }

    await this.notificationPort.cancelAllForHabit(input.habit.id);

    for (const slot of slots) {
      const copy = input.content({ kind: slot.kind, habitTitle: input.habit.title });

      await this.notificationPort.schedule({
        identifier: buildNotificationIdentifier(input.habit.id, slot),
        title: copy.title,
        body: copy.body,
        trigger: { type: 'daily', hour: slot.hour, minute: slot.minute },
        data: {
          habitId: input.habit.id,
          kind: slot.kind,
          deeplink: buildExcuseDeeplink(input.habit.id),
        },
      });
    }
  }
}

export class RescheduleAllNotificationsUseCase {
  constructor(
    private readonly habitRepository: HabitRepository,
    private readonly userProfileRepository: UserProfileRepository,
    private readonly scheduleHabitNotificationsUseCase: ScheduleHabitNotificationsUseCase,
  ) {}

  async execute(input: { content: NotificationContentBuilder }): Promise<void> {
    const [habits, profile] = await Promise.all([
      this.habitRepository.findAllActive(),
      this.userProfileRepository.get(),
    ]);

    for (const habit of habits) {
      await this.scheduleHabitNotificationsUseCase.execute({
        habit,
        profile,
        content: input.content,
      });
    }
  }
}

export class RequestNotificationPermissionUseCase {
  constructor(private readonly notificationPort: NotificationPort) {}

  async execute(): Promise<'granted' | 'denied'> {
    return this.notificationPort.requestPermissions();
  }
}
