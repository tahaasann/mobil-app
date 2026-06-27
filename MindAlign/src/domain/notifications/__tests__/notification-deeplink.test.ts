import {
  buildExcuseDeeplink,
  parseNotificationDeeplink,
} from '@/domain/notifications/notification-deeplink';

describe('notification deeplink', () => {
  it('builds excuse route from habit id', () => {
    expect(buildExcuseDeeplink('habit-abc')).toBe('/excuse/habit-abc');
  });

  it('parses habitId from notification data', () => {
    expect(parseNotificationDeeplink({ habitId: 'habit-abc', kind: 'checkin' })).toBe(
      '/excuse/habit-abc',
    );
  });

  it('parses explicit deeplink payload', () => {
    expect(parseNotificationDeeplink({ deeplink: '/excuse/habit-xyz' })).toBe(
      '/excuse/habit-xyz',
    );
  });

  it('returns null for invalid payload', () => {
    expect(parseNotificationDeeplink(undefined)).toBeNull();
    expect(parseNotificationDeeplink({})).toBeNull();
    expect(parseNotificationDeeplink({ deeplink: 'https://example.com' })).toBeNull();
  });
});
