import type { HabitLogRepository } from '@/application/ports/habit-log-repository.port';
import type { HabitRepository } from '@/application/ports/habit-repository.port';
import type { HabitLogStatus } from '@/domain/entities/habit-log';
import type { Habit } from '@/domain/entities/habit';
import { calculateStreak } from '@/domain/services/streak-calculator';
import { getLastNDates } from '@/domain/utils/date';

export type DashboardDay = {
  date: string;
  status: HabitLogStatus | null;
};

export type DashboardHabit = {
  habit: Habit;
  streak: number;
  days: DashboardDay[];
};

export type DashboardResult = {
  habits: DashboardHabit[];
};

type GetDashboardInput = {
  referenceDate: string;
};

export class GetDashboardUseCase {
  constructor(
    private readonly habitRepository: HabitRepository,
    private readonly habitLogRepository: HabitLogRepository,
  ) {}

  async execute(input: GetDashboardInput): Promise<DashboardResult> {
    const habits = await this.habitRepository.findAllActive();
    const dates = getLastNDates(input.referenceDate, 7);
    const habitIds = habits.map((habit) => habit.id);
    const logs =
      habitIds.length > 0
        ? await this.habitLogRepository.findByHabitIdsAndDates(habitIds, dates)
        : [];

    const dashboardHabits = habits.map((habit) => {
      const habitLogs = logs.filter((log) => log.habitId === habit.id);
      const logsByDate = new Map(habitLogs.map((log) => [log.date, log.status]));

      return {
        habit,
        streak: calculateStreak(habitLogs, input.referenceDate),
        days: dates.map((date) => ({
          date,
          status: logsByDate.get(date) ?? null,
        })),
      };
    });

    return { habits: dashboardHabits };
  }
}
