import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

admin.initializeApp();

type UsageDoc = {
  count: number;
  bonusCount: number;
};

function getLimit(input: {
  isPremium: boolean;
  freeWeeklyQuota: number;
  premiumWeeklyQuota: number;
  bonusCount: number;
}): number {
  if (input.isPremium) {
    return input.premiumWeeklyQuota;
  }
  return input.freeWeeklyQuota + input.bonusCount;
}

async function readUsage(uid: string, weekStart: string): Promise<UsageDoc> {
  const ref = admin.firestore().doc(`users/${uid}/aiUsage/${weekStart}`);
  const snap = await ref.get();
  const data = snap.data() as UsageDoc | undefined;
  return {
    count: data?.count ?? 0,
    bonusCount: data?.bonusCount ?? 0,
  };
}

export const consumeAiQuota = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method not allowed');
    return;
  }

  const authHeader = req.headers.authorization ?? '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    res.status(401).json({ ok: false, reason: 'unauthenticated' });
    return;
  }

  let uid: string;
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    uid = decoded.uid;
  } catch {
    res.status(401).json({ ok: false, reason: 'unauthenticated' });
    return;
  }

  const { weekStart, isPremium, freeWeeklyQuota, premiumWeeklyQuota } = req.body ?? {};
  if (!weekStart) {
    res.status(400).json({ ok: false, reason: 'invalid_request' });
    return;
  }

  const ref = admin.firestore().doc(`users/${uid}/aiUsage/${weekStart}`);

  try {
    const result = await admin.firestore().runTransaction(async (txn) => {
      const snap = await txn.get(ref);
      const usage = (snap.data() as UsageDoc | undefined) ?? { count: 0, bonusCount: 0 };
      const limit = getLimit({
        isPremium: Boolean(isPremium),
        freeWeeklyQuota: Number(freeWeeklyQuota ?? 3),
        premiumWeeklyQuota: Number(premiumWeeklyQuota ?? 60),
        bonusCount: usage.bonusCount,
      });

      if (usage.count >= limit) {
        return { ok: false as const, reason: 'quota_exceeded' as const };
      }

      const next = { ...usage, count: usage.count + 1 };
      txn.set(ref, next, { merge: true });
      return { ok: true as const, count: next.count, bonusCount: next.bonusCount };
    });

    res.json(result);
  } catch (error) {
    functions.logger.error('consumeAiQuota_failed', error);
    res.status(500).json({ ok: false, reason: 'internal' });
  }
});

export const getAiUsage = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method not allowed');
    return;
  }

  const authHeader = req.headers.authorization ?? '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    res.status(401).json({ ok: false, reason: 'unauthenticated' });
    return;
  }

  let uid: string;
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    uid = decoded.uid;
  } catch {
    res.status(401).json({ ok: false, reason: 'unauthenticated' });
    return;
  }

  const { weekStart } = req.body ?? {};
  if (!weekStart) {
    res.status(400).json({ ok: false, reason: 'invalid_request' });
    return;
  }

  const usage = await readUsage(uid, weekStart);
  res.json(usage);
});

export const addAiBonus = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method not allowed');
    return;
  }

  const authHeader = req.headers.authorization ?? '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    res.status(401).json({ ok: false, reason: 'unauthenticated' });
    return;
  }

  let uid: string;
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    uid = decoded.uid;
  } catch {
    res.status(401).json({ ok: false, reason: 'unauthenticated' });
    return;
  }

  const { weekStart } = req.body ?? {};
  if (!weekStart) {
    res.status(400).json({ ok: false, reason: 'invalid_request' });
    return;
  }

  const ref = admin.firestore().doc(`users/${uid}/aiUsage/${weekStart}`);
  const usage = await readUsage(uid, weekStart);
  const bonusCount = usage.bonusCount + 1;
  await ref.set({ ...usage, bonusCount }, { merge: true });
  res.json({ bonusCount });
});
