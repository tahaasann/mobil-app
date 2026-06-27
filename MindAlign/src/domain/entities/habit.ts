export class HabitValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'HabitValidationError';
  }
}

export type HabitSchedule = 'daily';

export type Habit = {
  id: string;
  title: string;
  description: string | null;
  schedule: HabitSchedule;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
};

export type CreateHabitInput = {
  title: string;
  description?: string | null;
  schedule?: HabitSchedule;
  sortOrder?: number;
};

const MAX_TITLE_LENGTH = 100;

function createId(): string {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `habit-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}

export function createHabit(input: CreateHabitInput): Habit {
  const title = input.title.trim();

  if (!title) {
    throw new HabitValidationError('Title is required');
  }

  if (title.length > MAX_TITLE_LENGTH) {
    throw new HabitValidationError(`Title must be at most ${MAX_TITLE_LENGTH} characters`);
  }

  return {
    id: createId(),
    title,
    description: input.description?.trim() ?? null,
    schedule: input.schedule ?? 'daily',
    isActive: true,
    sortOrder: input.sortOrder ?? 0,
    createdAt: new Date(),
  };
}
