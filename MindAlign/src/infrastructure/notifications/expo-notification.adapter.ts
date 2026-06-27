import * as Notifications from 'expo-notifications';

import type {
  LocalNotificationRequest,
  NotificationPort,
  NotificationPermissionStatus,
} from '@/application/ports/notification.port';

const ANDROID_CHANNEL_ID = 'mindalign-reminders';

async function ensureAndroidChannel(): Promise<void> {
  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: 'MindAlign reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

export class ExpoNotificationAdapter implements NotificationPort {
  async requestPermissions(): Promise<NotificationPermissionStatus> {
    const settings = await Notifications.getPermissionsAsync();

    if (settings.granted) {
      await ensureAndroidChannel();
      return 'granted';
    }

    const requested = await Notifications.requestPermissionsAsync();
    if (requested.granted) {
      await ensureAndroidChannel();
      return 'granted';
    }

    return 'denied';
  }

  async schedule(request: LocalNotificationRequest): Promise<void> {
    await ensureAndroidChannel();

    await Notifications.scheduleNotificationAsync({
      identifier: request.identifier,
      content: {
        title: request.title,
        body: request.body,
        data: request.data,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: request.trigger.hour,
        minute: request.trigger.minute,
        channelId: ANDROID_CHANNEL_ID,
      },
    });
  }

  async cancel(identifier: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  }

  async cancelAllForHabit(habitId: string): Promise<void> {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const identifiers = scheduled
      .map((item) => item.identifier)
      .filter((identifier): identifier is string => Boolean(identifier))
      .filter((identifier) => identifier.startsWith(`${habitId}-`));

    await Promise.all(identifiers.map((identifier) => this.cancel(identifier)));
  }

  async cancelAll(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
}
