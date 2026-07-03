import type { HabitLogRepository } from '@/application/ports/habit-log-repository.port';
import type { HabitNoteRepository } from '@/application/ports/habit-note-repository.port';
import type { HabitRepository } from '@/application/ports/habit-repository.port';
import type { HabitNote } from '@/domain/entities/habit-note';
import type { Habit } from '@/domain/entities/habit';
import { calculateStreak } from '@/domain/services/streak-calculator';
import { getLastNDates } from '@/domain/utils/date';

import type { DashboardDay } from './get-dashboard.use-case';

export type HabitDetailResult = {
  habit: Habit;
  streak: number;
  days: DashboardDay[];
  notes: HabitNote[];
};

type GetHabitDetailInput = {
  habitId: string;
  referenceDate: string;
};

export class HabitNotFoundError extends Error {
  constructor(habitId: string) {
    super(`Habit not found: ${habitId}`);
    this.name = 'HabitNotFoundError';
  }
}

export class GetHabitDetailUseCase {
  constructor(
    private readonly habitRepository: HabitRepository,
    private readonly habitLogRepository: HabitLogRepository,
    private readonly habitNoteRepository: HabitNoteRepository,
  ) {}

  async execute(input: GetHabitDetailInput): Promise<HabitDetailResult> {
    const habit = await this.habitRepository.findById(input.habitId);

    if (!habit || !habit.isActive) {
      throw new HabitNotFoundError(input.habitId);
    }

    const heatmapDates = getLastNDates(input.referenceDate, 7);
    const [logs, heatmapLogs, notes] = await Promise.all([
      this.habitLogRepository.findByHabitIds([habit.id]),
      this.habitLogRepository.findByHabitIdsAndDates([habit.id], heatmapDates),
      this.habitNoteRepository.findByHabitId(habit.id),
    ]);

    const logsByDate = new Map(heatmapLogs.map((log) => [log.date, log.status]));

    return {
      habit,
      streak: calculateStreak(logs, input.referenceDate),
      days: heatmapDates.map((date) => ({
        date,
        status: logsByDate.get(date) ?? null,
      })),
      notes,
    };
  }
}
