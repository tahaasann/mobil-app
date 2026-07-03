export type ProfileSummaryInput = {
  habits: { streak: number }[];
};

export type ProfileSummary = {
  habitCount: number;
  bestStreak: number;
  activeStreakCount: number;
};

export function buildProfileSummary(input: ProfileSummaryInput): ProfileSummary {
  const { habits } = input;

  return {
    habitCount: habits.length,
    bestStreak: habits.reduce((max, habit) => Math.max(max, habit.streak), 0),
    activeStreakCount: habits.filter((habit) => habit.streak > 0).length,
  };
}

export function resolveProfileInitials(email: string | null | undefined, isGuest: boolean): string {
  if (isGuest || !email) {
    return 'G';
  }

  const localPart = email.split('@')[0]?.trim();
  if (!localPart) {
    return '?';
  }

  return localPart.charAt(0).toUpperCase();
}
