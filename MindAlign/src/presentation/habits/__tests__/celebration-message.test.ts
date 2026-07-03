import {
  resolveCelebrationMessageKey,
  resolveCelebrationStreak,
} from '@/presentation/habits/celebration-message';

describe('celebration message helpers', () => {
  it('maps streak 1 to first-day copy bucket', () => {
    expect(resolveCelebrationMessageKey(1)).toBe('first');
  });

  it('maps mid streaks to building bucket', () => {
    expect(resolveCelebrationMessageKey(3)).toBe('building');
  });

  it('maps day 7 to milestone bucket', () => {
    expect(resolveCelebrationMessageKey(7)).toBe('milestone');
  });

  it('maps long streaks to legend bucket', () => {
    expect(resolveCelebrationMessageKey(30)).toBe('legend');
  });

  it('optimistically increments streak when today is not done yet', () => {
    expect(resolveCelebrationStreak(6, false)).toBe(7);
  });

  it('keeps streak when today was already marked done', () => {
    expect(resolveCelebrationStreak(6, true)).toBe(6);
  });
});
