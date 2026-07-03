import {
  buildProfileSummary,
  resolveProfileInitials,
} from '@/presentation/profile/profile-summary';

describe('profile-summary', () => {
  it('computes habit count, best streak, and active streak count', () => {
    expect(
      buildProfileSummary({
        habits: [{ streak: 3 }, { streak: 7 }, { streak: 0 }],
      }),
    ).toEqual({
      habitCount: 3,
      bestStreak: 7,
      activeStreakCount: 2,
    });
  });

  it('returns zeros for empty habits', () => {
    expect(buildProfileSummary({ habits: [] })).toEqual({
      habitCount: 0,
      bestStreak: 0,
      activeStreakCount: 0,
    });
  });

  it('resolves avatar initials for guest and email users', () => {
    expect(resolveProfileInitials(null, true)).toBe('G');
    expect(resolveProfileInitials('coach@example.com', false)).toBe('C');
  });
});
