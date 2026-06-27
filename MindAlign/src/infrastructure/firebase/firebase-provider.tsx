import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import {
  bootstrapFirebase,
  type FirebaseBootstrapResult,
  type FirebaseBootstrapStatus,
} from '@/infrastructure/firebase/firebase-bootstrap';

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

  return (
    <FirebaseContext.Provider value={{ status: result.status, message: result.message }}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebaseStatus(): FirebaseContextValue {
  return useContext(FirebaseContext);
}
