export type AppEnv = 'development' | 'preview' | 'production';

const VALID_APP_ENVS: readonly AppEnv[] = ['development', 'preview', 'production'];

export function parseAppEnv(value: unknown): AppEnv {
  if (value === undefined || value === null || value === '') {
    return 'development';
  }

  if (typeof value === 'string' && (VALID_APP_ENVS as readonly string[]).includes(value)) {
    return value as AppEnv;
  }

  throw new Error(
    `Invalid APP_ENV "${String(value)}". Expected one of: ${VALID_APP_ENVS.join(', ')}`,
  );
}

export function resolveAppEnv(sources: {
  appEnvFromConfig?: unknown;
  appEnvFromProcess?: unknown;
}): AppEnv {
  const raw =
    sources.appEnvFromConfig !== undefined && sources.appEnvFromConfig !== null
      ? sources.appEnvFromConfig
      : sources.appEnvFromProcess;

  return parseAppEnv(raw);
}
