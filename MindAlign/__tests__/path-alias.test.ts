import { createDefaultAppSettings } from '@/domain/entities/app-settings';

describe('@/ path alias', () => {
  it('resolves domain layer imports', () => {
    expect(createDefaultAppSettings().id).toBe('default');
  });
});
