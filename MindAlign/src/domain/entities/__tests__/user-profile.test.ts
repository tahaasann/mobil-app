import {
  createDefaultUserProfile,
  upsertUserProfile,
  USER_PROFILE_ID,
} from '@/domain/entities/user-profile';

describe('user profile entity', () => {
  it('creates a default profile with gentle tone', () => {
    const profile = createDefaultUserProfile();
    expect(profile.defaultTone).toBe('gentle');
    expect(profile.id).toBe(USER_PROFILE_ID);
  });

  it('upserts onboarding fields while preserving id', () => {
    const profile = upsertUserProfile(null, {
      identityGoal: '  Calm parent  ',
      defaultTone: 'direct',
      commonBarrier: 'no_time',
      notifWindow: 'morning',
      notifFrequency: 1,
    });

    expect(profile.identityGoal).toBe('Calm parent');
    expect(profile.defaultTone).toBe('direct');
    expect(profile.commonBarrier).toBe('no_time');
    expect(profile.notifWindow).toBe('morning');
    expect(profile.notifFrequency).toBe(1);
  });
});
