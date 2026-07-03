import {
  habitAccentToSortOrder,
  resolveHabitAccentFromSortOrder,
} from '@/domain/entities/habit-accent';

describe('habit-accent', () => {
  it('maps accent to sort order bands and back', () => {
    expect(habitAccentToSortOrder('emerald')).toBe(100);
    expect(resolveHabitAccentFromSortOrder(100)).toBe('emerald');
    expect(resolveHabitAccentFromSortOrder(250)).toBe('amber');
  });
});
