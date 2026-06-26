import { useEffect, useState } from 'react';

import { HealthCheckUseCase } from '@/application/use-cases/health-check.use-case';
import type { HealthCheckResult } from '@/application/ports/health-repository.port';
import { DrizzleHealthAdapter } from '@/infrastructure/database/drizzle-health.adapter';
import { useAppDatabase } from '@/infrastructure/database/database-provider';

export type HealthCheckState = { status: 'loading' } | HealthCheckResult;

export function useHealthCheck(): HealthCheckState {
  const db = useAppDatabase();
  const [state, setState] = useState<HealthCheckState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const useCase = new HealthCheckUseCase(new DrizzleHealthAdapter(db));
      const result = await useCase.execute();
      if (!cancelled) {
        setState(result);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [db]);

  return state;
}
