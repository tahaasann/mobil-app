import { getApp } from '@react-native-firebase/app';
import {
  deleteUser,
  getAuth,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type FirebaseAuthTypes,
} from '@react-native-firebase/auth';

import type { AuthPort, AuthUser } from '@/application/ports/auth.port';

import { mapFirebaseUser } from './firebase-auth.mapper';

function getFirebaseAuth(): FirebaseAuthTypes.Module {
  return getAuth(getApp());
}

export class FirebaseAuthAdapter implements AuthPort {
  async getCurrentUser(): Promise<AuthUser | null> {
    const user = getFirebaseAuth().currentUser;
    return user ? mapFirebaseUser(user) : null;
  }

  async signInAnonymously(): Promise<AuthUser> {
    const credential = await signInAnonymously(getFirebaseAuth());
    if (!credential.user) {
      throw new Error('auth_no_user_after_anonymous_sign_in');
    }
    return mapFirebaseUser(credential.user);
  }

  async signInWithEmail(email: string, password: string): Promise<AuthUser> {
    const credential = await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
    if (!credential.user) {
      throw new Error('auth_no_user_after_email_sign_in');
    }
    return mapFirebaseUser(credential.user);
  }

  async signOut(): Promise<void> {
    await firebaseSignOut(getFirebaseAuth());
  }

  async deleteAccount(): Promise<void> {
    const user = getFirebaseAuth().currentUser;
    if (!user) {
      throw new Error('auth_no_current_user');
    }
    await deleteUser(user);
  }

  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    return firebaseOnAuthStateChanged(getFirebaseAuth(), (user) => {
      callback(user ? mapFirebaseUser(user) : null);
    });
  }
}
