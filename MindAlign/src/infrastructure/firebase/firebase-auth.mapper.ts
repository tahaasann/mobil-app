export function mapFirebaseUser(user: {
  uid: string;
  email: string | null;
  isAnonymous: boolean;
  displayName: string | null;
}): import('@/application/ports/auth.port').AuthUser {
  return {
    id: user.uid,
    email: user.email,
    isAnonymous: user.isAnonymous,
    displayName: user.displayName,
  };
}
