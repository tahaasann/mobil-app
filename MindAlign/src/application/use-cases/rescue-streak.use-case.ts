import type { HabitLogRepository } from '@/application/ports/habit-log-repository.port';
import { createHabitLog, type HabitLog } from '@/domain/entities/habit-log';

export type RescueStreakInput = {
  habitId: string;
  date: string;
  excuseText?: string | null;
  barrierLabel?: string | null;
  rescueTaskText?: string | null;
};

export class RescueStreakUseCase {
  constructor(private readonly habitLogRepository: HabitLogRepository) {}

  async execute(input: RescueStreakInput): Promise<HabitLog> {
    const log = createHabitLog({
      habitId: input.habitId,
      date: input.date,
      status: 'rescued',
      excuseText: input.excuseText,
      barrierLabel: input.barrierLabel,
      rescueTaskText: input.rescueTaskText,
    });

    await this.habitLogRepository.upsert(log);
    return log;
  }
}

export type FailStreakInput = {
  habitId: string;
  date: string;
  excuseText?: string | null;
};

export class FailStreakUseCase {
  constructor(private readonly habitLogRepository: HabitLogRepository) {}

  async execute(input: FailStreakInput): Promise<HabitLog> {
    const log = createHabitLog({
      habitId: input.habitId,
      date: input.date,
      status: 'failed',
      excuseText: input.excuseText,
    });

    await this.habitLogRepository.upsert(log);
    return log;
  }
}
