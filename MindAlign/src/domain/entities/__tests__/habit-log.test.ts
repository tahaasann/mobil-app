import { createHabitLog, HabitLogValidationError } from '@/domain/entities/habit-log';

describe('HabitLog entity', () => {
  it('creates a success log for a valid date', () => {
    const log = createHabitLog({
      habitId: 'habit-1',
      date: '2026-06-26',
      status: 'success',
    });

    expect(log.status).toBe('success');
    expect(log.habitId).toBe('habit-1');
  });

  it('accepts rescued and failed statuses', () => {
    expect(createHabitLog({ habitId: 'h1', date: '2026-06-25', status: 'rescued' }).status).toBe(
      'rescued',
    );
    expect(createHabitLog({ habitId: 'h1', date: '2026-06-24', status: 'failed' }).status).toBe(
      'failed',
    );
  });

  it('rejects invalid date format', () => {
    expect(() => createHabitLog({ habitId: 'h1', date: '26-06-2026', status: 'success' })).toThrow(
      HabitLogValidationError,
    );
  });

  it('rejects empty habit id', () => {
    expect(() => createHabitLog({ habitId: '', date: '2026-06-26', status: 'success' })).toThrow(
      HabitLogValidationError,
    );
  });
});
