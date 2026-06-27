import type { HabitLogRepository } from '@/application/ports/habit-log-repository.port';
import {
  createHabitLog,
  type CreateHabitLogInput,
  type HabitLog,
} from '@/domain/entities/habit-log';

export class LogHabitUseCase {
  constructor(private readonly habitLogRepository: HabitLogRepository) {}

  async execute(input: CreateHabitLogInput): Promise<HabitLog> {
    const log = createHabitLog(input);
    await this.habitLogRepository.upsert(log);
    return log;
  }
}
