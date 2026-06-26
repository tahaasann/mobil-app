import type { HealthRepository } from '@/application/ports/health-repository.port';
import { HealthCheckUseCase } from '@/application/use-cases/health-check.use-case';

class FakeHealthRepository implements HealthRepository {
  constructor(private readonly shouldFail = false) {}

  async ping(): Promise<void> {
    if (this.shouldFail) {
      throw new Error('database unavailable');
    }
  }
}

describe('HealthCheckUseCase', () => {
  it('returns DB OK when repository ping succeeds', async () => {
    const useCase = new HealthCheckUseCase(new FakeHealthRepository(false));
    await expect(useCase.execute()).resolves.toEqual({ status: 'ok', message: 'DB OK' });
  });

  it('returns DB Error when repository ping fails', async () => {
    const useCase = new HealthCheckUseCase(new FakeHealthRepository(true));
    await expect(useCase.execute()).resolves.toEqual({ status: 'error', message: 'DB Error' });
  });
});
