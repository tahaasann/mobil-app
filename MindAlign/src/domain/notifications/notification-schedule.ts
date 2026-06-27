export type NotifWindow = 'morning' | 'afternoon' | 'evening';

export type NotificationKind = 'checkin' | 'streak_risk';

export type NotificationTimeSlot = {
  kind: NotificationKind;
  hour: number;
  minute: number;
};

export type NotificationScheduleInput = {
  notifWindow: NotifWindow | string | null;
  notifFrequency: number | null;
};

const WINDOW_SLOTS: Record<NotifWindow, Omit<NotificationTimeSlot, 'kind'>[]> = {
  morning: [
    { hour: 8, minute: 0 },
    { hour: 10, minute: 30 },
  ],
  afternoon: [
    { hour: 14, minute: 0 },
    { hour: 16, minute: 30 },
  ],
  evening: [
    { hour: 19, minute: 0 },
    { hour: 21, minute: 0 },
  ],
};

const STREAK_RISK_SLOT: Omit<NotificationTimeSlot, 'kind'> = { hour: 21, minute: 30 };

function isNotifWindow(value: string | null): value is NotifWindow {
  return value === 'morning' || value === 'afternoon' || value === 'evening';
}

export function buildNotificationSchedule(
  input: NotificationScheduleInput,
): NotificationTimeSlot[] {
  if (!input.notifWindow || !isNotifWindow(input.notifWindow)) {
    return [];
  }

  const windowSlots = WINDOW_SLOTS[input.notifWindow];
  const checkinCount = input.notifFrequency === 2 ? 2 : 1;

  const checkins: NotificationTimeSlot[] = windowSlots.slice(0, checkinCount).map((slot) => ({
    ...slot,
    kind: 'checkin',
  }));

  return [...checkins, { ...STREAK_RISK_SLOT, kind: 'streak_risk' }];
}

export function buildNotificationIdentifier(
  habitId: string,
  slot: NotificationTimeSlot,
): string {
  return `${habitId}-${slot.kind}-${slot.hour}-${slot.minute}`;
}
