import * as domain from '@/domain';

describe('@/ path alias', () => {
  it('resolves domain layer imports', () => {
    expect(domain).toBeDefined();
  });
});
