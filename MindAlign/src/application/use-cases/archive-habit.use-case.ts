import type { NotificationPort } from '@/application/ports/notification.port';
import type { HabitRepository } from '@/application/ports/habit-repository.port';

import { HabitNotFoundError } from './get-habit-detail.use-case';

export class ArchiveHabitUseCase {
  constructor(
    private readonly habitRepository: HabitRepository,
    private readonly notificationPort: NotificationPort,
  ) {}

  async execute(habitId: string): Promise<void> {
    const existing = await this.habitRepository.findById(habitId);

    if (!existing || !existing.isActive) {
      throw new HabitNotFoundError(habitId);
    }

    await this.habitRepository.archive(habitId);
    await this.notificationPort.cancelAllForHabit(habitId);
  }
}
