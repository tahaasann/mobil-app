import { parseAppEnv, resolveAppEnv } from '@/infrastructure/config/app-env';

describe('app-env', () => {
  it('resolveAppEnv falls back to process env when config extra is missing', () => {
    expect(
      resolveAppEnv({
        appEnvFromConfig: undefined,
        appEnvFromProcess: 'preview',
      }),
    ).toBe('preview');
  });

  it('parseAppEnv rejects null values with development default', () => {
    expect(parseAppEnv(null)).toBe('development');
  });
});
