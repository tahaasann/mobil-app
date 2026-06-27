import type {
  LocalNotificationRequest,
  NotificationPort,
  NotificationPermissionStatus,
} from '@/application/ports/notification.port';

export class MockNotificationAdapter implements NotificationPort {
  private scheduled = new Map<string, LocalNotificationRequest>();
  private permission: NotificationPermissionStatus = 'granted';

  setPermission(status: NotificationPermissionStatus): void {
    this.permission = status;
  }

  async requestPermissions(): Promise<NotificationPermissionStatus> {
    return this.permission;
  }

  async schedule(request: LocalNotificationRequest): Promise<void> {
    this.scheduled.set(request.identifier, request);
  }

  async cancel(identifier: string): Promise<void> {
    this.scheduled.delete(identifier);
  }

  async cancelAllForHabit(habitId: string): Promise<void> {
    for (const key of [...this.scheduled.keys()]) {
      if (key.startsWith(`${habitId}-`)) {
        this.scheduled.delete(key);
      }
    }
  }

  async cancelAll(): Promise<void> {
    this.scheduled.clear();
  }

  getScheduled(): LocalNotificationRequest[] {
    return [...this.scheduled.values()];
  }
}

export function resetMockNotificationAdapter(adapter: MockNotificationAdapter): void {
  adapter['scheduled'].clear();
  adapter.setPermission('granted');
}
