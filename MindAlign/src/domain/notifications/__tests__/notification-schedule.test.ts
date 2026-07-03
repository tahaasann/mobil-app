import {
  buildNotificationIdentifier,
  buildNotificationSchedule,
  countScheduledNotifications,
} from '@/domain/notifications/notification-schedule';

describe('buildNotificationSchedule', () => {
  it('returns empty schedule when notifications are skipped', () => {
    expect(buildNotificationSchedule({ notifWindow: null, notifFrequency: null })).toEqual([]);
  });

  it('returns one checkin and streak risk for morning once daily', () => {
    expect(buildNotificationSchedule({ notifWindow: 'morning', notifFrequency: 1 })).toEqual([
      { kind: 'checkin', hour: 8, minute: 0 },
      { kind: 'streak_risk', hour: 21, minute: 30 },
    ]);
  });

  it('returns two checkins and streak risk for evening twice daily', () => {
    expect(buildNotificationSchedule({ notifWindow: 'evening', notifFrequency: 2 })).toEqual([
      { kind: 'checkin', hour: 19, minute: 0 },
      { kind: 'checkin', hour: 21, minute: 0 },
      { kind: 'streak_risk', hour: 21, minute: 30 },
    ]);
  });

  it('uses afternoon slots when selected', () => {
    expect(buildNotificationSchedule({ notifWindow: 'afternoon', notifFrequency: 2 })).toEqual([
      { kind: 'checkin', hour: 14, minute: 0 },
      { kind: 'checkin', hour: 16, minute: 30 },
      { kind: 'streak_risk', hour: 21, minute: 30 },
    ]);
  });
});

describe('countScheduledNotifications (T-240)', () => {
  it('matches once-daily label to two scheduled notifications', () => {
    expect(countScheduledNotifications({ notifWindow: 'morning', notifFrequency: 1 })).toBe(2);
  });

  it('matches twice-daily label to three scheduled notifications', () => {
    expect(countScheduledNotifications({ notifWindow: 'evening', notifFrequency: 2 })).toBe(3);
  });
});

describe('buildNotificationIdentifier', () => {
  it('builds a stable identifier per habit and slot', () => {
    expect(
      buildNotificationIdentifier('habit-1', {
        kind: 'checkin',
        hour: 8,
        minute: 0,
      }),
    ).toBe('habit-1-checkin-8-0');
  });
});
