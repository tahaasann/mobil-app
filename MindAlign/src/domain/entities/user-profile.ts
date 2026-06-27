export type CoachTone = 'gentle' | 'direct';

export type UserProfile = {
  id: string;
  identityGoal: string | null;
  defaultTone: CoachTone;
  commonBarrier: string | null;
  notifWindow: string | null;
  notifFrequency: number | null;
  updatedAt: Date;
};

export type UpsertUserProfileInput = {
  identityGoal?: string | null;
  defaultTone: CoachTone;
  commonBarrier?: string | null;
  notifWindow?: string | null;
  notifFrequency?: number | null;
};

const DEFAULT_PROFILE_ID = 'default';

export function createDefaultUserProfile(): UserProfile {
  return {
    id: DEFAULT_PROFILE_ID,
    identityGoal: null,
    defaultTone: 'gentle',
    commonBarrier: null,
    notifWindow: null,
    notifFrequency: null,
    updatedAt: new Date(),
  };
}

export function upsertUserProfile(
  current: UserProfile | null,
  input: UpsertUserProfileInput,
): UserProfile {
  const base = current ?? createDefaultUserProfile();

  return {
    ...base,
    identityGoal: input.identityGoal?.trim() || null,
    defaultTone: input.defaultTone,
    commonBarrier: input.commonBarrier?.trim() || null,
    notifWindow: input.notifWindow ?? null,
    notifFrequency: input.notifFrequency ?? null,
    updatedAt: new Date(),
  };
}

export const USER_PROFILE_ID = DEFAULT_PROFILE_ID;
