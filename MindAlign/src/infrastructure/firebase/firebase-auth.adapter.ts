import {
  getAuth,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from '@react-native-firebase/auth';

import type { AuthPort, AuthUser } from '@/application/ports/auth.port';

import { mapFirebaseUser } from './firebase-auth.mapper';

export class FirebaseAuthAdapter implements AuthPort {
  async getCurrentUser(): Promise<AuthUser | null> {
    const user = getAuth().currentUser;
    return user ? mapFirebaseUser(user) : null;
  }

  async signInAnonymously(): Promise<AuthUser> {
    const credential = await signInAnonymously(getAuth());
    return mapFirebaseUser(credential.user);
  }

  async signInWithEmail(email: string, password: string): Promise<AuthUser> {
    const credential = await signInWithEmailAndPassword(getAuth(), email, password);
    return mapFirebaseUser(credential.user);
  }

  async signOut(): Promise<void> {
    await firebaseSignOut(getAuth());
  }

  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    return firebaseOnAuthStateChanged(getAuth(), (user) => {
      callback(user ? mapFirebaseUser(user) : null);
    });
  }
}
