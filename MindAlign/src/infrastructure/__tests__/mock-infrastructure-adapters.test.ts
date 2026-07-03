import { MockRemoteConfigAdapter } from '@/infrastructure/firebase/mock-remote-config.adapter';
import { MockNotificationAdapter } from '@/infrastructure/notifications/mock-notification.adapter';
import { MockReviewAdapter } from '@/infrastructure/reviews/mock-review.adapter';

describe('mock infrastructure adapters', () => {
  it('stores remote config overrides', async () => {
    const remoteConfig = new MockRemoteConfigAdapter();

    await remoteConfig.configure();
    await remoteConfig.fetchAndActivate();
    remoteConfig.setValues({ aiEnabled: false });

    await expect(remoteConfig.getValues()).resolves.toEqual(
      expect.objectContaining({ aiEnabled: false }),
    );
  });

  it('schedules and cancels notifications', async () => {
    const notifications = new MockNotificationAdapter();
    notifications.setPermission('denied');

    await expect(notifications.requestPermissions()).resolves.toBe('denied');
    await notifications.schedule({
      identifier: 'habit-1-morning',
      title: 'Morning',
      body: 'Check in',
      trigger: { hour: 8, minute: 0, repeats: true },
    });

    expect(notifications.getScheduled()).toHaveLength(1);
    await notifications.cancelAllForHabit('habit-1');
    expect(notifications.getScheduled()).toHaveLength(0);

    await notifications.schedule({
      identifier: 'habit-2-evening',
      title: 'Evening',
      body: 'Check in',
      trigger: { hour: 20, minute: 0, repeats: true },
    });
    await notifications.cancel('habit-2-evening');
    await notifications.cancelAll();
    expect(notifications.getScheduled()).toHaveLength(0);
  });

  it('records review requests', async () => {
    const review = new MockReviewAdapter();

    await expect(review.isAvailable()).resolves.toBe(true);
    await review.requestReview();
    expect(review.requested).toBe(true);
  });
});
