import type { NotificationContentBuilder } from '@/application/use-cases/notification.use-case';

export function createNotificationContentBuilder(
  t: (key: string, options?: Record<string, unknown>) => string,
): NotificationContentBuilder {
  return ({ kind, habitTitle }) => {
    if (kind === 'checkin') {
      return {
        title: t('notifications.checkin.title'),
        body: t('notifications.checkin.body', { habit: habitTitle }),
      };
    }

    return {
      title: t('notifications.streakRisk.title'),
      body: t('notifications.streakRisk.body', { habit: habitTitle }),
    };
  };
}
