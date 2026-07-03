import {
  formatAuthErrorForLog,
  getFirebaseAuthErrorCode,
  resolveAuthErrorTranslationKey,
} from '@/infrastructure/firebase/parse-firebase-auth-error';

describe('parse-firebase-auth-error', () => {
  it('reads Firebase auth error codes', () => {
    expect(getFirebaseAuthErrorCode({ code: 'auth/operation-not-allowed' })).toBe(
      'auth/operation-not-allowed',
    );
    expect(getFirebaseAuthErrorCode(new Error('plain'))).toBeUndefined();
  });

  it('maps known codes to translation keys', () => {
    expect(resolveAuthErrorTranslationKey({ code: 'auth/operation-not-allowed' })).toBe(
      'auth.errors.anonymousDisabled',
    );
    expect(resolveAuthErrorTranslationKey({ code: 'auth/network-request-failed' })).toBe(
      'auth.errors.network',
    );
    expect(resolveAuthErrorTranslationKey({ code: 'auth/app-check-token-invalid' })).toBe(
      'auth.errors.appCheck',
    );
    expect(resolveAuthErrorTranslationKey(new Error('unknown'))).toBe('auth.errorGeneric');
  });

  it('formats errors for logs', () => {
    expect(formatAuthErrorForLog({ code: 'auth/too-many-requests', message: 'Slow down' })).toBe(
      'auth/too-many-requests: Slow down',
    );
  });
});
