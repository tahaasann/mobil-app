import {
  FailStreakUseCase,
  RescueStreakUseCase,
} from '@/application/use-cases/rescue-streak.use-case';
import type { HabitLogRepository } from '@/application/ports/habit-log-repository.port';

describe('RescueStreakUseCase', () => {
  it('persists rescued log with metadata', async () => {
    const upsert = jest.fn(async () => undefined);
    const repository: HabitLogRepository = {
      upsert,
      findByHabitIdsAndDates: jest.fn(),
      findByHabitIdAndDate: jest.fn(),
    };

    const useCase = new RescueStreakUseCase(repository);
    const log = await useCase.execute({
      habitId: 'habit-1',
      date: '2026-06-26',
      excuseText: 'Yorgunum',
      barrierLabel: 'Yorgunluk',
      rescueTaskText: '2 dk hazırlık',
    });

    expect(log.status).toBe('rescued');
    expect(log.barrierLabel).toBe('Yorgunluk');
    expect(repository.upsert).toHaveBeenCalled();
  });
});

describe('FailStreakUseCase', () => {
  it('persists failed log', async () => {
    const upsert = jest.fn(async () => undefined);
    const repository: HabitLogRepository = {
      upsert,
      findByHabitIdsAndDates: jest.fn(),
      findByHabitIdAndDate: jest.fn(),
    };

    const useCase = new FailStreakUseCase(repository);
    const log = await useCase.execute({
      habitId: 'habit-1',
      date: '2026-06-26',
      excuseText: 'Vazgeçtim',
    });

    expect(log.status).toBe('failed');
  });
});
