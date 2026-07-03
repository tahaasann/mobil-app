type FirebaseAuthErrorLike = {
  code?: string;
  message?: string;
};

export function getFirebaseAuthErrorCode(error: unknown): string | undefined {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = (error as FirebaseAuthErrorLike).code;
    return typeof code === 'string' ? code : undefined;
  }
  return undefined;
}

/** Maps Firebase Auth error codes to i18n keys under `auth.errors.*`. */
export function resolveAuthErrorTranslationKey(error: unknown): string {
  const code = getFirebaseAuthErrorCode(error);

  switch (code) {
    case 'auth/operation-not-allowed':
      return 'auth.errors.anonymousDisabled';
    case 'auth/network-request-failed':
      return 'auth.errors.network';
    case 'auth/too-many-requests':
      return 'auth.errors.tooManyRequests';
    case 'auth/admin-restricted-operation':
      return 'auth.errors.adminRestricted';
    case 'auth/app-check-token-invalid':
    case 'auth/firebase-app-check-token-is-invalid':
      return 'auth.errors.appCheck';
    default:
      return 'auth.errorGeneric';
  }
}

export function formatAuthErrorForLog(error: unknown): string {
  const code = getFirebaseAuthErrorCode(error);
  let message: string;
  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'object' && error !== null && 'message' in error) {
    const raw = (error as FirebaseAuthErrorLike).message;
    message = typeof raw === 'string' ? raw : String(error);
  } else {
    message = String(error);
  }
  return code ? `${code}: ${message}` : message;
}
