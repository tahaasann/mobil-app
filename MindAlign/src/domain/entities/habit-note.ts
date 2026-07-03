export class HabitNoteValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'HabitNoteValidationError';
  }
}

export type HabitNote = {
  id: string;
  habitId: string;
  content: string;
  createdAt: Date;
};

export type CreateHabitNoteInput = {
  habitId: string;
  content: string;
};

const MAX_NOTE_LENGTH = 500;

function createId(): string {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `habit-note-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}

export function createHabitNote(input: CreateHabitNoteInput): HabitNote {
  const content = input.content.trim();

  if (!content) {
    throw new HabitNoteValidationError('Note content is required');
  }

  if (content.length > MAX_NOTE_LENGTH) {
    throw new HabitNoteValidationError(`Note must be at most ${MAX_NOTE_LENGTH} characters`);
  }

  return {
    id: createId(),
    habitId: input.habitId,
    content,
    createdAt: new Date(),
  };
}
