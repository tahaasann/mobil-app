import type {
  HealthCheckResult,
  HealthRepository,
} from '@/application/ports/health-repository.port';

export class HealthCheckUseCase {
  constructor(private readonly healthRepository: HealthRepository) {}

  async execute(): Promise<HealthCheckResult> {
    try {
      await this.healthRepository.ping();
      return { status: 'ok', message: 'DB OK' };
    } catch {
      return { status: 'error', message: 'DB Error' };
    }
  }
}
