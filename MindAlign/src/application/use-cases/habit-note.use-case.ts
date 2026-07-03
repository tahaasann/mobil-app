import type { HabitNoteRepository } from '@/application/ports/habit-note-repository.port';
import type { HabitRepository } from '@/application/ports/habit-repository.port';
import {
  createHabitNote,
  type CreateHabitNoteInput,
  type HabitNote,
} from '@/domain/entities/habit-note';

import { HabitNotFoundError } from './get-habit-detail.use-case';

export class AddHabitNoteUseCase {
  constructor(
    private readonly habitRepository: HabitRepository,
    private readonly habitNoteRepository: HabitNoteRepository,
  ) {}

  async execute(input: CreateHabitNoteInput): Promise<HabitNote> {
    const habit = await this.habitRepository.findById(input.habitId);

    if (!habit || !habit.isActive) {
      throw new HabitNotFoundError(input.habitId);
    }

    const note = createHabitNote(input);
    await this.habitNoteRepository.save(note);
    return note;
  }
}

export class DeleteHabitNoteUseCase {
  constructor(private readonly habitNoteRepository: HabitNoteRepository) {}

  async execute(noteId: string): Promise<void> {
    await this.habitNoteRepository.delete(noteId);
  }
}

export class ListHabitNotesUseCase {
  constructor(private readonly habitNoteRepository: HabitNoteRepository) {}

  execute(habitId: string): Promise<HabitNote[]> {
    return this.habitNoteRepository.findByHabitId(habitId);
  }
}
