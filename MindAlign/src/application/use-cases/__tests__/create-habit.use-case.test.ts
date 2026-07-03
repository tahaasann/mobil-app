import { CreateHabitUseCase } from '@/application/use-cases/create-habit.use-case';
import type { HabitRepository } from '@/application/ports/habit-repository.port';
import type { Habit } from '@/domain/entities/habit';

class InMemoryHabitRepository implements HabitRepository {
  public items: Habit[] = [];

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

describe('CreateHabitUseCase', () => {
  it('creates and persists a habit', async () => {
    const repo = new InMemoryHabitRepository();
    const useCase = new CreateHabitUseCase(repo);

    const habit = await useCase.execute({ title: 'Meditate' });

    expect(habit.title).toBe('Meditate');
    expect(repo.items).toHaveLength(1);
  });

  it('rejects invalid title', async () => {
    const useCase = new CreateHabitUseCase(new InMemoryHabitRepository());
    await expect(useCase.execute({ title: '   ' })).rejects.toThrow();
  });
});
