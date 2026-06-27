import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import type { AuthUser } from '@/application/ports/auth.port';
import { SignInAsGuestUseCase } from '@/application/use-cases/sign-in-as-guest.use-case';
import { SignInWithEmailUseCase } from '@/application/use-cases/sign-in-with-email.use-case';
import { SignOutUseCase } from '@/application/use-cases/sign-out.use-case';
import { SyncOnLoginUseCase } from '@/application/use-cases/sync-on-login.use-case';
import { FirebaseAuthAdapter } from '@/infrastructure/firebase/firebase-auth.adapter';
import { MockAuthAdapter } from '@/infrastructure/firebase/mock-auth.adapter';

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  signInAsGuest: () => Promise<AuthUser>;
  signInWithEmail: (email: string, password: string) => Promise<AuthUser>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function createAuthPort() {
  if (process.env.EXPO_PUBLIC_AUTH_MOCK === 'true') {
    return new MockAuthAdapter();
  }
  return new FirebaseAuthAdapter();
}

type AuthProviderProps = {
  children: ReactNode;
  syncOnLoginUseCase?: SyncOnLoginUseCase;
};

export function AuthProvider({ children, syncOnLoginUseCase }: AuthProviderProps) {
  const authPort = useMemo(() => createAuthPort(), []);
  const signInAsGuestUseCase = useMemo(() => new SignInAsGuestUseCase(authPort), [authPort]);
  const signInWithEmailUseCase = useMemo(() => new SignInWithEmailUseCase(authPort), [authPort]);
  const signOutUseCase = useMemo(() => new SignOutUseCase(authPort), [authPort]);

  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authPort.onAuthStateChanged((nextUser) => {
      setUser(nextUser);
      setIsLoading(false);
      if (nextUser && syncOnLoginUseCase) {
        void syncOnLoginUseCase.execute(nextUser.id);
      }
    });
    return unsubscribe;
  }, [authPort, syncOnLoginUseCase]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      signInAsGuest: () => signInAsGuestUseCase.execute(),
      signInWithEmail: (email, password) => signInWithEmailUseCase.execute({ email, password }),
      signOut: () => signOutUseCase.execute(),
    }),
    [user, isLoading, signInAsGuestUseCase, signInWithEmailUseCase, signOutUseCase],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
