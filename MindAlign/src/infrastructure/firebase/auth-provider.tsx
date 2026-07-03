import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import type { AuthUser } from '@/application/ports/auth.port';
import { SignInAsGuestUseCase } from '@/application/use-cases/sign-in-as-guest.use-case';
import { SignInWithEmailUseCase } from '@/application/use-cases/sign-in-with-email.use-case';
import {
  HandleAuthSessionUseCase,
  SignOutSessionUseCase,
} from '@/application/use-cases/auth-session.use-case';
import { createAuthPort } from '@/infrastructure/firebase/create-auth-port';
import { formatAuthErrorForLog } from '@/infrastructure/firebase/parse-firebase-auth-error';

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  signInAsGuest: () => Promise<AuthUser>;
  signInWithEmail: (email: string, password: string) => Promise<AuthUser>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
  handleAuthSessionUseCase?: HandleAuthSessionUseCase;
  signOutSessionUseCase?: SignOutSessionUseCase;
};

export function AuthProvider({
  children,
  handleAuthSessionUseCase,
  signOutSessionUseCase,
}: AuthProviderProps) {
  const authPort = useMemo(() => createAuthPort(), []);
  const signInAsGuestUseCase = useMemo(() => new SignInAsGuestUseCase(authPort), [authPort]);
  const signInWithEmailUseCase = useMemo(() => new SignInWithEmailUseCase(authPort), [authPort]);

  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authPort.onAuthStateChanged((nextUser) => {
      setUser(nextUser);
      setIsLoading(false);
      if (nextUser && handleAuthSessionUseCase) {
        void handleAuthSessionUseCase.execute(nextUser).catch((error) => {
          if (__DEV__) {
            console.error('[AuthProvider] handleAuthSession failed', formatAuthErrorForLog(error));
          }
        });
      }
    });
    return unsubscribe;
  }, [authPort, handleAuthSessionUseCase]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      signInAsGuest: () => signInAsGuestUseCase.execute(),
      signInWithEmail: (email, password) => signInWithEmailUseCase.execute({ email, password }),
      signOut: async () => {
        if (signOutSessionUseCase) {
          await signOutSessionUseCase.execute();
        }
        await authPort.signOut();
      },
    }),
    [
      user,
      isLoading,
      signInAsGuestUseCase,
      signInWithEmailUseCase,
      signOutSessionUseCase,
      authPort,
    ],
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
