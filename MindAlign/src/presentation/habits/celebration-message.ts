export type CelebrationMessageKey = 'first' | 'building' | 'milestone' | 'legend';

export function resolveCelebrationMessageKey(streak: number): CelebrationMessageKey {
  if (streak <= 1) {
    return 'first';
  }

  if (streak < 7) {
    return 'building';
  }

  if (streak < 30) {
    return 'milestone';
  }

  return 'legend';
}

export function resolveCelebrationStreak(streak: number, todayAlreadyDone: boolean): number {
  if (todayAlreadyDone) {
    return Math.max(1, streak);
  }

  return Math.max(1, streak + 1);
}
