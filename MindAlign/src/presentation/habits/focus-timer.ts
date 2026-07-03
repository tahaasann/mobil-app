export const DEFAULT_FOCUS_SECONDS = 5 * 60;

export function formatFocusTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function nextFocusSecondsRemaining(
  remainingSeconds: number,
  isRunning: boolean,
): number | null {
  if (!isRunning) {
    return remainingSeconds;
  }

  if (remainingSeconds <= 1) {
    return 0;
  }

  return remainingSeconds - 1;
}
