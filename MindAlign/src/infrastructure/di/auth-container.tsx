import type { ReactNode } from 'react';

import { AuthProvider } from '@/infrastructure/firebase/auth-provider';
import { useAppContainer } from '@/infrastructure/di/app-container';

export function AuthContainer({ children }: { children: ReactNode }) {
  const { syncOnLoginUseCase } = useAppContainer();
  return <AuthProvider syncOnLoginUseCase={syncOnLoginUseCase}>{children}</AuthProvider>;
}
