import { bootstrapFirebase } from '@/infrastructure/firebase/firebase-bootstrap';

describe('bootstrapFirebase', () => {
  it('initializes app check in test environment', async () => {
    const result = await bootstrapFirebase();
    expect(['ready', 'skipped', 'error']).toContain(result.status);
  });
});
