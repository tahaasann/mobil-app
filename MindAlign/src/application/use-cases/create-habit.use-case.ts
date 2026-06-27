import type { HabitRepository } from '@/application/ports/habit-repository.port';
import { createHabit, type CreateHabitInput, type Habit } from '@/domain/entities/habit';

export class CreateHabitUseCase {
  constructor(private readonly habitRepository: HabitRepository) {}

  async execute(input: CreateHabitInput): Promise<Habit> {
    const habit = createHabit(input);
    await this.habitRepository.create(habit);
    return habit;
  }
}
