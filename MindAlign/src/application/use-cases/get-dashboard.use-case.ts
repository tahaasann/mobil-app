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
    const heatmapDates = getLastNDates(input.referenceDate, 7);
    const habitIds = habits.map((habit) => habit.id);

    const [allLogs, heatmapLogs] = await Promise.all([
      habitIds.length > 0 ? this.habitLogRepository.findByHabitIds(habitIds) : Promise.resolve([]),
      habitIds.length > 0
        ? this.habitLogRepository.findByHabitIdsAndDates(habitIds, heatmapDates)
        : Promise.resolve([]),
    ]);

    const dashboardHabits = habits.map((habit) => {
      const habitLogsForStreak = allLogs.filter((log) => log.habitId === habit.id);
      const heatmapForHabit = heatmapLogs.filter((log) => log.habitId === habit.id);
      const logsByDate = new Map(heatmapForHabit.map((log) => [log.date, log.status]));

      return {
        habit,
        streak: calculateStreak(habitLogsForStreak, input.referenceDate),
        days: heatmapDates.map((date) => ({
          date,
          status: logsByDate.get(date) ?? null,
        })),
      };
    });

    return { habits: dashboardHabits };
  }
}
