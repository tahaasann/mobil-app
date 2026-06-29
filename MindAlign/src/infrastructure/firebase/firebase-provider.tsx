import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import {
  bootstrapFirebase,
  type FirebaseBootstrapResult,
  type FirebaseBootstrapStatus,
} from '@/infrastructure/firebase/firebase-bootstrap';
import { isProductionEnv } from '@/infrastructure/config/production-guard';

type FirebaseContextValue = {
  status: FirebaseBootstrapStatus;
  message?: string;
};

const FirebaseContext = createContext<FirebaseContextValue>({ status: 'idle' });

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [result, setResult] = useState<FirebaseBootstrapResult>({ status: 'idle' });

  useEffect(() => {
    let cancelled = false;

    bootstrapFirebase().then((next) => {
      if (!cancelled) {
        setResult(next);
        if (__DEV__) {
          console.info('[Firebase]', next.status, next.message ?? '');
        }
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  if (result.status === 'idle') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isProductionEnv() && result.status === 'error') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text style={{ textAlign: 'center' }}>
          Firebase App Check could not start. Please update the app or try again later.
        </Text>
      </View>
    );
  }

  return (
    <FirebaseContext.Provider value={{ status: result.status, message: result.message }}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebaseStatus(): FirebaseContextValue {
  return useContext(FirebaseContext);
}
