const SAFE_HABIT_ID_PATTERN = /^[a-zA-Z0-9-]{1,64}$/;

function isSafeHabitId(habitId: string): boolean {
  return SAFE_HABIT_ID_PATTERN.test(habitId);
}

export function buildExcuseDeeplink(habitId: string): string {
  if (!isSafeHabitId(habitId)) {
    throw new Error('Invalid habit id for deeplink');
  }

  return `/excuse/${encodeURIComponent(habitId)}`;
}

export function parseNotificationDeeplink(
  data: Record<string, unknown> | undefined,
): string | null {
  if (!data) {
    return null;
  }

  const habitId = data.habitId;
  if (typeof habitId === 'string' && isSafeHabitId(habitId)) {
    return buildExcuseDeeplink(habitId);
  }

  const deeplink = data.deeplink;
  if (typeof deeplink === 'string' && deeplink.startsWith('/excuse/')) {
    const rawId = deeplink.slice('/excuse/'.length);
    if (!rawId || !isSafeHabitId(decodeURIComponent(rawId))) {
      return null;
    }

    return deeplink;
  }

  return null;
}
