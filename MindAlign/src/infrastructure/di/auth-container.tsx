import type { ReactNode } from 'react';

import { AuthProvider } from '@/infrastructure/firebase/auth-provider';
import { useAppContainer } from '@/infrastructure/di/app-container';

export function AuthContainer({ children }: { children: ReactNode }) {
  const { handleAuthSessionUseCase, signOutSessionUseCase } = useAppContainer();
  return (
    <AuthProvider
      handleAuthSessionUseCase={handleAuthSessionUseCase}
      signOutSessionUseCase={signOutSessionUseCase}
    >
      {children}
    </AuthProvider>
  );
}
