import {
  collection,
  doc,
  getDocs,
  getFirestore,
  query,
  setDoc,
  where,
  writeBatch,
} from '@react-native-firebase/firestore';

import type { SyncEntityType, SyncPort, SyncRecord } from '@/application/ports/sync.port';
import {
  SyncPayloadValidationError,
  validateSyncPayload,
  validateSyncRecordSize,
} from '@/domain/sync/sync-payload-schemas';

export class FirestoreSyncAdapter implements SyncPort {
  async push(userId: string, entity: SyncEntityType, records: SyncRecord[]): Promise<void> {
    const db = getFirestore();
    const colRef = collection(db, 'users', userId, entity);

    for (const record of records) {
      validateSyncRecordSize(entity, record.payload);
      const payload = validateSyncPayload(entity, record.payload);
      await setDoc(
        doc(colRef, record.id),
        {
          ...payload,
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

    return snapshot.docs
      .map((document) => {
        const data = document.data();
        const { updatedAt, ...payload } = data;
        try {
          validateSyncRecordSize(entity, payload as Record<string, unknown>);
          const validated = validateSyncPayload(entity, payload as Record<string, unknown>);
          return {
            id: document.id,
            updatedAt: String(updatedAt),
            payload: validated,
          };
        } catch (error) {
          if (error instanceof SyncPayloadValidationError) {
            return null;
          }
          throw error;
        }
      })
      .filter((record): record is SyncRecord => record !== null);
  }

  async deleteAllUserData(userId: string): Promise<void> {
    const db = getFirestore();
    const entities: SyncEntityType[] = ['bookmarks', 'chat_messages'];

    for (const entity of entities) {
      const colRef = collection(db, 'users', userId, entity);
      const snapshot = await getDocs(colRef);
      if (snapshot.empty) {
        continue;
      }

      const batch = writeBatch(db);
      for (const document of snapshot.docs) {
        batch.delete(document.ref);
      }
      await batch.commit();
    }
  }
}
