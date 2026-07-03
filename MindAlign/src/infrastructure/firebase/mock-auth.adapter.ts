import type { AuthPort, AuthUser } from '@/application/ports/auth.port';

let currentUser: AuthUser | null = null;
const listeners = new Set<(user: AuthUser | null) => void>();

function notify() {
  for (const listener of listeners) {
    listener(currentUser);
  }
}

export class MockAuthAdapter implements AuthPort {
  async getCurrentUser(): Promise<AuthUser | null> {
    return currentUser;
  }

  async signInAnonymously(): Promise<AuthUser> {
    currentUser = {
      id: 'mock-guest',
      email: null,
      isAnonymous: true,
      displayName: null,
    };
    notify();
    return currentUser;
  }

  async signInWithEmail(email: string, _password: string): Promise<AuthUser> {
    currentUser = {
      id: 'mock-user',
      email,
      isAnonymous: false,
      displayName: null,
    };
    notify();
    return currentUser;
  }

  async signOut(): Promise<void> {
    currentUser = null;
    notify();
  }

  async deleteAccount(): Promise<void> {
    currentUser = null;
    notify();
  }

  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    listeners.add(callback);
    callback(currentUser);
    return () => {
      listeners.delete(callback);
    };
  }
}

export function resetMockAuthAdapter(): void {
  currentUser = null;
  listeners.clear();
}
