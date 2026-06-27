export type DailyNotificationTrigger = {
  type: 'daily';
  hour: number;
  minute: number;
};

export type LocalNotificationRequest = {
  identifier: string;
  title: string;
  body: string;
  trigger: DailyNotificationTrigger;
  data: Record<string, string>;
};

export type NotificationPermissionStatus = 'granted' | 'denied';

export type NotificationPort = {
  requestPermissions(): Promise<NotificationPermissionStatus>;
  schedule(request: LocalNotificationRequest): Promise<void>;
  cancel(identifier: string): Promise<void>;
  cancelAllForHabit(habitId: string): Promise<void>;
  cancelAll(): Promise<void>;
};
