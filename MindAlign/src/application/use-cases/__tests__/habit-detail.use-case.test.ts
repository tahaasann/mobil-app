import type { HabitLogRepository } from '@/application/ports/habit-log-repository.port';
import type { HabitNoteRepository } from '@/application/ports/habit-note-repository.port';
import type { HabitRepository } from '@/application/ports/habit-repository.port';
import {
  GetHabitDetailUseCase,
  HabitNotFoundError,
} from '@/application/use-cases/get-habit-detail.use-case';
import { UpdateHabitUseCase } from '@/application/use-cases/update-habit.use-case';
import { ArchiveHabitUseCase } from '@/application/use-cases/archive-habit.use-case';
import {
  AddHabitNoteUseCase,
  DeleteHabitNoteUseCase,
} from '@/application/use-cases/habit-note.use-case';
import type { NotificationPort } from '@/application/ports/notification.port';
import { createHabit } from '@/domain/entities/habit';
import { createHabitLog } from '@/domain/entities/habit-log';
import { createHabitNote } from '@/domain/entities/habit-note';
import type { HabitNote } from '@/domain/entities/habit-note';
import type { Habit } from '@/domain/entities/habit';

class InMemoryHabitRepository implements HabitRepository {
  constructor(public items: Habit[]) {}

  async create(habit: Habit): Promise<void> {
    this.items.push(habit);
  }

  async findAllActive(): Promise<Habit[]> {
    return this.items.filter((item) => item.isActive);
  }

  async findById(id: string): Promise<Habit | null> {
    return this.items.find((item) => item.id === id) ?? null;
  }

  async update(habit: Habit): Promise<void> {
    const index = this.items.findIndex((item) => item.id === habit.id);
    if (index >= 0) {
      this.items[index] = habit;
    }
  }

  async archive(id: string): Promise<void> {
    const habit = this.items.find((item) => item.id === id);
    if (habit) {
      habit.isActive = false;
    }
  }
}

class InMemoryHabitLogRepository implements HabitLogRepository {
  constructor(
    private readonly logs: ReturnType<typeof createHabitLog>[] = [],
  ) {}

  async upsert(): Promise<void> {}

  async findByHabitIds(habitIds: string[]) {
    return this.logs.filter((log) => habitIds.includes(log.habitId));
  }

  async findByHabitIdsAndDates(habitIds: string[], dates: string[]) {
    return this.logs.filter((log) => habitIds.includes(log.habitId) && dates.includes(log.date));
  }

  async findByHabitIdAndDate(habitId: string, date: string) {
    return this.logs.find((log) => log.habitId === habitId && log.date === date) ?? null;
  }
}

class InMemoryHabitNoteRepository implements HabitNoteRepository {
  public notes: HabitNote[] = [];

  async findByHabitId(habitId: string): Promise<HabitNote[]> {
    return this.notes.filter((note) => note.habitId === habitId);
  }

  async save(note: HabitNote): Promise<void> {
    this.notes.push(note);
  }

  async delete(id: string): Promise<void> {
    this.notes = this.notes.filter((note) => note.id !== id);
  }
}

class InMemoryNotificationPort implements NotificationPort {
  public cancelledHabitIds: string[] = [];

  async requestPermissions(): Promise<'granted' | 'denied'> {
    return 'granted';
  }

  async schedule(): Promise<void> {}

  async cancel(): Promise<void> {}

  async cancelAllForHabit(habitId: string): Promise<void> {
    this.cancelledHabitIds.push(habitId);
  }

  async cancelAll(): Promise<void> {}
}

describe('GetHabitDetailUseCase', () => {
  it('returns habit detail with streak, heatmap, and notes', async () => {
    const habit = createHabit({ title: 'Journal' });
    const logRepo = new InMemoryHabitLogRepository([
      createHabitLog({ habitId: habit.id, date: '2026-06-26', status: 'success' }),
    ]);
    const noteRepo = new InMemoryHabitNoteRepository();
    noteRepo.notes = [createHabitNote({ habitId: habit.id, content: 'Felt calm today' })];
    const useCase = new GetHabitDetailUseCase(
      new InMemoryHabitRepository([habit]),
      logRepo,
      noteRepo,
    );

    const detail = await useCase.execute({ habitId: habit.id, referenceDate: '2026-06-26' });

    expect(detail.habit.title).toBe('Journal');
    expect(detail.streak).toBeGreaterThanOrEqual(1);
    expect(detail.days).toHaveLength(7);
    expect(detail.notes[0]?.content).toBe('Felt calm today');
  });

  it('throws when habit is missing', async () => {
    const useCase = new GetHabitDetailUseCase(
      new InMemoryHabitRepository([]),
      new InMemoryHabitLogRepository(),
      new InMemoryHabitNoteRepository(),
    );

    await expect(
      useCase.execute({ habitId: 'missing', referenceDate: '2026-06-26' }),
    ).rejects.toBeInstanceOf(HabitNotFoundError);
  });
});

describe('UpdateHabitUseCase', () => {
  it('updates title and description', async () => {
    const habit = createHabit({ title: 'Walk', description: 'Morning' });
    const repo = new InMemoryHabitRepository([habit]);
    const useCase = new UpdateHabitUseCase(repo);

    const updated = await useCase.execute({
      habitId: habit.id,
      title: 'Evening walk',
      description: 'After dinner',
    });

    expect(updated.title).toBe('Evening walk');
    expect(updated.description).toBe('After dinner');
    expect(repo.items[0]?.title).toBe('Evening walk');
  });
});

describe('ArchiveHabitUseCase', () => {
  it('archives habit and cancels notifications', async () => {
    const habit = createHabit({ title: 'Stretch' });
    const repo = new InMemoryHabitRepository([habit]);
    const notifications = new InMemoryNotificationPort();
    const useCase = new ArchiveHabitUseCase(repo, notifications);

    await useCase.execute(habit.id);

    expect(repo.items[0]?.isActive).toBe(false);
    expect(notifications.cancelledHabitIds).toEqual([habit.id]);
  });
});

describe('Habit note use cases', () => {
  it('adds and deletes notes for an active habit', async () => {
    const habit = createHabit({ title: 'Read' });
    const habitRepo = new InMemoryHabitRepository([habit]);
    const noteRepo = new InMemoryHabitNoteRepository();
    const addUseCase = new AddHabitNoteUseCase(habitRepo, noteRepo);
    const deleteUseCase = new DeleteHabitNoteUseCase(noteRepo);

    const note = await addUseCase.execute({ habitId: habit.id, content: 'Finished chapter 3' });
    expect(noteRepo.notes).toHaveLength(1);

    await deleteUseCase.execute(note.id);
    expect(noteRepo.notes).toHaveLength(0);
  });
});
