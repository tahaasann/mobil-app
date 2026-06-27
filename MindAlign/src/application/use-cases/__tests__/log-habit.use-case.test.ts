import { LogHabitUseCase } from '@/application/use-cases/log-habit.use-case';
import type { HabitLogRepository } from '@/application/ports/habit-log-repository.port';
import type { HabitLog } from '@/domain/entities/habit-log';

class InMemoryHabitLogRepository implements HabitLogRepository {
  public items: HabitLog[] = [];

  async upsert(log: HabitLog): Promise<void> {
    const index = this.items.findIndex(
      (item) => item.habitId === log.habitId && item.date === log.date,
    );
    if (index >= 0) {
      this.items[index] = log;
      return;
    }
    this.items.push(log);
  }

  async findByHabitIdsAndDates(habitIds: string[], dates: string[]): Promise<HabitLog[]> {
    return this.items.filter(
      (item) => habitIds.includes(item.habitId) && dates.includes(item.date),
    );
  }

  async findByHabitIdAndDate(habitId: string, date: string): Promise<HabitLog | null> {
    return this.items.find((item) => item.habitId === habitId && item.date === date) ?? null;
  }
}

describe('LogHabitUseCase', () => {
  it('logs success for a habit on a date', async () => {
    const repo = new InMemoryHabitLogRepository();
    const useCase = new LogHabitUseCase(repo);

    const log = await useCase.execute({
      habitId: 'habit-1',
      date: '2026-06-26',
      status: 'success',
    });

    expect(log.status).toBe('success');
    expect(repo.items).toHaveLength(1);
  });
});
