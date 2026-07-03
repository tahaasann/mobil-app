import { GetDashboardUseCase } from '@/application/use-cases/get-dashboard.use-case';
import type { HabitRepository } from '@/application/ports/habit-repository.port';
import type { HabitLogRepository } from '@/application/ports/habit-log-repository.port';
import { createHabit } from '@/domain/entities/habit';
import { createHabitLog } from '@/domain/entities/habit-log';

class FakeHabitRepository implements HabitRepository {
  constructor(private readonly habits = [createHabit({ title: 'Run' })]) {}

  async create(): Promise<void> {}

  async findAllActive() {
    return this.habits;
  }

  async findById(id: string) {
    return this.habits.find((habit) => habit.id === id) ?? null;
  }

  async update(): Promise<void> {}

  async archive(): Promise<void> {}
}

class FakeHabitLogRepository implements HabitLogRepository {
  constructor(
    private readonly logs = [
      createHabitLog({ habitId: 'x', date: '2026-06-26', status: 'success' }),
    ],
  ) {}

  async upsert(): Promise<void> {}

  async findByHabitIds(habitIds: string[]) {
    return this.logs.filter((log) => habitIds.includes(log.habitId));
  }

  async findByHabitIdsAndDates(habitIds: string[], dates: string[]) {
    return this.logs.filter((log) => habitIds.includes(log.habitId) && dates.includes(log.date));
  }

  async findByHabitIdAndDate(habitId: string, date: string) {
    return this.logs.find((log) => log.habitId === habitId && log.date === date) ?? null;
  }
}

describe('GetDashboardUseCase', () => {
  it('returns habits with seven day window', async () => {
    const habit = createHabit({ title: 'Read' });
    const logRepo = new FakeHabitLogRepository([
      createHabitLog({ habitId: habit.id, date: '2026-06-26', status: 'success' }),
    ]);
    const habitRepo = new FakeHabitRepository([habit]);
    const useCase = new GetDashboardUseCase(habitRepo, logRepo);

    const dashboard = await useCase.execute({ referenceDate: '2026-06-26' });

    expect(dashboard.habits).toHaveLength(1);
    expect(dashboard.habits[0]?.days).toHaveLength(7);
    expect(dashboard.habits[0]?.habit.title).toBe('Read');
  });
});
