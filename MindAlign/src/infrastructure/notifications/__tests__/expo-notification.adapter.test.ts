import * as Notifications from 'expo-notifications';

import { ExpoNotificationAdapter } from '@/infrastructure/notifications/expo-notification.adapter';

describe('ExpoNotificationAdapter', () => {
  it('requests permissions and schedules a daily notification', async () => {
    const adapter = new ExpoNotificationAdapter();

    await expect(adapter.requestPermissions()).resolves.toBe('granted');

    await adapter.schedule({
      identifier: 'habit-1-checkin-8-0',
      title: 'Check-in',
      body: 'Meditate',
      trigger: { type: 'daily', hour: 8, minute: 0 },
      data: { habitId: 'habit-1', deeplink: '/excuse/habit-1' },
    });

    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        identifier: 'habit-1-checkin-8-0',
        content: expect.objectContaining({
          title: 'Check-in',
          data: { habitId: 'habit-1', deeplink: '/excuse/habit-1' },
        }),
      }),
    );
  });
});
