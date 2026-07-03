import {
  DEFAULT_FOCUS_SECONDS,
  formatFocusTime,
  nextFocusSecondsRemaining,
} from '@/presentation/habits/focus-timer';

describe('focus timer helpers', () => {
  it('formats mm:ss', () => {
    expect(formatFocusTime(DEFAULT_FOCUS_SECONDS)).toBe('5:00');
    expect(formatFocusTime(65)).toBe('1:05');
  });

  it('ticks down while running and stops at zero', () => {
    expect(nextFocusSecondsRemaining(10, true)).toBe(9);
    expect(nextFocusSecondsRemaining(1, true)).toBe(0);
    expect(nextFocusSecondsRemaining(10, false)).toBe(10);
  });
});
