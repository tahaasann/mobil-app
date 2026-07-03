import type { HabitRepository } from '@/application/ports/habit-repository.port';
import {
  applyHabitUpdate,
  type Habit,
  type UpdateHabitInput,
} from '@/domain/entities/habit';

import { HabitNotFoundError } from './get-habit-detail.use-case';

type UpdateHabitCommand = {
  habitId: string;
} & UpdateHabitInput;

export class UpdateHabitUseCase {
  constructor(private readonly habitRepository: HabitRepository) {}

  async execute(input: UpdateHabitCommand): Promise<Habit> {
    const existing = await this.habitRepository.findById(input.habitId);

    if (!existing || !existing.isActive) {
      throw new HabitNotFoundError(input.habitId);
    }

    const updated = applyHabitUpdate(existing, {
      title: input.title,
      description: input.description,
    });

    await this.habitRepository.update(updated);
    return updated;
  }
}
