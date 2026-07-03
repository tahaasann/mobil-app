import { addDoc, collection, getFirestore } from '@react-native-firebase/firestore';
import { getAuth } from '@react-native-firebase/auth';

import type { AiReportInput, AiReportPort } from '@/application/ports/ai-report.port';

export class FirestoreAiReportAdapter implements AiReportPort {
  async submitReport(input: AiReportInput): Promise<void> {
    const user = getAuth().currentUser;
    if (!user) {
      return;
    }

    await addDoc(collection(getFirestore(), 'ai_reports'), {
      userId: user.uid,
      messageId: input.messageId,
      habitId: input.habitId,
      category: input.category,
      contentPreview: input.contentPreview.slice(0, 500),
      createdAt: new Date().toISOString(),
    });
  }
}
