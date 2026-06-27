export class HabitLogValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'HabitLogValidationError';
  }
}

export type HabitLogStatus = 'success' | 'rescued' | 'failed';

export type HabitLog = {
  id: string;
  habitId: string;
  date: string;
  status: HabitLogStatus;
  excuseText?: string | null;
  barrierLabel?: string | null;
  rescueTaskText?: string | null;
  createdAt: Date;
};

export type CreateHabitLogInput = {
  habitId: string;
  date: string;
  status: HabitLogStatus;
  excuseText?: string | null;
  barrierLabel?: string | null;
  rescueTaskText?: string | null;
};

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function createId(): string {
  return (
    globalThis.crypto?.randomUUID?.() ?? `log-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}

export function createHabitLog(input: CreateHabitLogInput): HabitLog {
  if (!input.habitId.trim()) {
    throw new HabitLogValidationError('Habit id is required');
  }

  if (!DATE_PATTERN.test(input.date)) {
    throw new HabitLogValidationError('Date must be YYYY-MM-DD');
  }

  return {
    id: createId(),
    habitId: input.habitId,
    date: input.date,
    status: input.status,
    excuseText: input.excuseText ?? null,
    barrierLabel: input.barrierLabel ?? null,
    rescueTaskText: input.rescueTaskText ?? null,
    createdAt: new Date(),
  };
}
