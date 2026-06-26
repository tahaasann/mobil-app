export type HealthCheckStatus = 'ok' | 'error';

export interface HealthCheckResult {
  status: HealthCheckStatus;
  message: string;
}

export interface HealthRepository {
  ping(): Promise<void>;
}
