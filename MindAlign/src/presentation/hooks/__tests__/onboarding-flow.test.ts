import {
  canFinishOnboarding,
  createOnboardingDraft,
  getNextOnboardingStep,
  getPreviousOnboardingStep,
  ONBOARDING_STEPS,
} from '@/presentation/hooks/onboarding-flow';

describe('onboarding flow navigation', () => {
  it('walks forward and backward through steps', () => {
    expect(getNextOnboardingStep('welcome')).toBe('approach');
    expect(getNextOnboardingStep('notifications')).toBeNull();
    expect(getPreviousOnboardingStep('approach')).toBe('welcome');
    expect(getPreviousOnboardingStep('welcome')).toBeNull();
    expect(ONBOARDING_STEPS.at(-1)).toBe('notifications');
  });

  it('requires at least one habit before finishing', () => {
    expect(canFinishOnboarding(createOnboardingDraft())).toBe(false);
    expect(
      canFinishOnboarding({
        ...createOnboardingDraft(),
        habitTitles: ['Meditate'],
      }),
    ).toBe(true);
  });
});
