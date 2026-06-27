import { calculateStreak } from '@/domain/services/streak-calculator';

describe('calculateStreak', () => {
  it('counts consecutive success days ending on reference date', () => {
    const streak = calculateStreak(
      [
        { date: '2026-06-26', status: 'success' },
        { date: '2026-06-25', status: 'success' },
        { date: '2026-06-24', status: 'success' },
      ],
      '2026-06-26',
    );

    expect(streak).toBe(3);
  });

  it('preserves streak when day is rescued (yellow)', () => {
    const streak = calculateStreak(
      [
        { date: '2026-06-26', status: 'success' },
        { date: '2026-06-25', status: 'rescued' },
        { date: '2026-06-24', status: 'success' },
      ],
      '2026-06-26',
    );

    expect(streak).toBe(3);
  });

  it('breaks streak on failed day', () => {
    const streak = calculateStreak(
      [
        { date: '2026-06-26', status: 'success' },
        { date: '2026-06-25', status: 'failed' },
        { date: '2026-06-24', status: 'success' },
      ],
      '2026-06-26',
    );

    expect(streak).toBe(1);
  });

  it('breaks streak when a day has no log', () => {
    const streak = calculateStreak(
      [
        { date: '2026-06-26', status: 'success' },
        { date: '2026-06-24', status: 'success' },
      ],
      '2026-06-26',
    );

    expect(streak).toBe(1);
  });

  it('returns zero when reference day is failed', () => {
    const streak = calculateStreak([{ date: '2026-06-26', status: 'failed' }], '2026-06-26');
    expect(streak).toBe(0);
  });
});
