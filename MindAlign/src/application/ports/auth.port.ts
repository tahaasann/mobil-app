export type AuthUser = {
  id: string;
  email: string | null;
  isAnonymous: boolean;
  displayName: string | null;
};

export type AuthPort = {
  getCurrentUser(): Promise<AuthUser | null>;
  signInAnonymously(): Promise<AuthUser>;
  signInWithEmail(email: string, password: string): Promise<AuthUser>;
  signOut(): Promise<void>;
  deleteAccount(): Promise<void>;
  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void;
};
