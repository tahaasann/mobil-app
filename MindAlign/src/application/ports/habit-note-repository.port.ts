import type { HabitNote } from '@/domain/entities/habit-note';

export interface HabitNoteRepository {
  findByHabitId(habitId: string): Promise<HabitNote[]>;
  save(note: HabitNote): Promise<void>;
  delete(id: string): Promise<void>;
}
