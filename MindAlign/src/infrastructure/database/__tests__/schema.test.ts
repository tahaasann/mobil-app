import { habits, habitLogs } from '@/infrastructure/database/schema';

describe('habits schema', () => {
  it('defines habits table columns', () => {
    expect(habits.id.name).toBe('id');
    expect(habits.title.name).toBe('title');
    expect(habits.schedule.name).toBe('schedule');
    expect(habits.isActive.name).toBe('is_active');
  });

  it('defines habit_logs table with habit reference', () => {
    expect(habitLogs.habitId.name).toBe('habit_id');
    expect(habitLogs.date.name).toBe('date');
    expect(habitLogs.status.name).toBe('status');
  });
});
