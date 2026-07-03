export type CreateHabitFormInput = {
  title: string;
  description?: string;
  accent?: import('@/domain/entities/habit-accent').HabitAccent;
  enableReminders?: boolean;
};
