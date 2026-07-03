import type { Habit, CreateHabitInput } from '@/domain/entities/habit';

export interface HabitRepository {
  create(habit: Habit): Promise<void>;
  findAllActive(): Promise<Habit[]>;
  findById(id: string): Promise<Habit | null>;
  update(habit: Habit): Promise<void>;
  archive(id: string): Promise<void>;
}

export type { CreateHabitInput };
