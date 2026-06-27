export function buildExcuseDeeplink(habitId: string): string {
  return `/excuse/${habitId}`;
}

export function parseNotificationDeeplink(
  data: Record<string, unknown> | undefined,
): string | null {
  if (!data) {
    return null;
  }

  const habitId = data.habitId;
  if (typeof habitId === 'string' && habitId.length > 0) {
    return buildExcuseDeeplink(habitId);
  }

  const deeplink = data.deeplink;
  if (typeof deeplink === 'string' && deeplink.startsWith('/excuse/')) {
    return deeplink;
  }

  return null;
}
