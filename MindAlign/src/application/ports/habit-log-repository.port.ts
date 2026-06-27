import type { HabitLog, HabitLogStatus } from '@/domain/entities/habit-log';

export interface HabitLogRepository {
  upsert(log: HabitLog): Promise<void>;
  findByHabitIdsAndDates(habitIds: string[], dates: string[]): Promise<HabitLog[]>;
  findByHabitIdAndDate(habitId: string, date: string): Promise<HabitLog | null>;
}

export type { HabitLogStatus };
