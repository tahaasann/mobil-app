import {
  collection,
  doc,
  getDocs,
  getFirestore,
  query,
  setDoc,
  where,
} from '@react-native-firebase/firestore';

import type { SyncEntityType, SyncPort, SyncRecord } from '@/application/ports/sync.port';

export class FirestoreSyncAdapter implements SyncPort {
  async push(userId: string, entity: SyncEntityType, records: SyncRecord[]): Promise<void> {
    const db = getFirestore();
    const colRef = collection(db, 'users', userId, entity);

    for (const record of records) {
      await setDoc(
        doc(colRef, record.id),
        {
          ...record.payload,
          updatedAt: record.updatedAt,
        },
        { merge: true },
      );
    }
  }

  async pull(userId: string, entity: SyncEntityType, since?: string): Promise<SyncRecord[]> {
    const db = getFirestore();
    const colRef = collection(db, 'users', userId, entity);
    const snapshot = since
      ? await getDocs(query(colRef, where('updatedAt', '>', since)))
      : await getDocs(colRef);

    return snapshot.docs.map((document) => {
      const data = document.data();
      const { updatedAt, ...payload } = data;
      return {
        id: document.id,
        updatedAt: String(updatedAt),
        payload: payload as Record<string, unknown>,
      };
    });
  }
}
