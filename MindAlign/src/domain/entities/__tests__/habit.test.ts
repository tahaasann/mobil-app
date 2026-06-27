import { createHabit, HabitValidationError } from '@/domain/entities/habit';

describe('Habit entity', () => {
  it('creates a habit with trimmed title', () => {
    const habit = createHabit({ title: '  Drink water  ' });
    expect(habit.title).toBe('Drink water');
    expect(habit.id).toEqual(expect.any(String));
    expect(habit.isActive).toBe(true);
  });

  it('rejects empty title', () => {
    expect(() => createHabit({ title: '   ' })).toThrow(HabitValidationError);
  });

  it('rejects title longer than 100 characters', () => {
    expect(() => createHabit({ title: 'a'.repeat(101) })).toThrow(HabitValidationError);
  });
});
