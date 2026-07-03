import type { AuthPort } from '@/application/ports/auth.port';
import { isProductionEnv } from '@/infrastructure/config/production-guard';
import { FirebaseAuthAdapter } from '@/infrastructure/firebase/firebase-auth.adapter';
import { MockAuthAdapter } from '@/infrastructure/firebase/mock-auth.adapter';

export function createAuthPort(): AuthPort {
  if (process.env.EXPO_PUBLIC_AUTH_MOCK === 'true') {
    if (isProductionEnv()) {
      throw new Error('EXPO_PUBLIC_AUTH_MOCK is not allowed in production');
    }
    return new MockAuthAdapter();
  }
  return new FirebaseAuthAdapter();
}
