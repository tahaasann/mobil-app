import type { ApproachLens } from '@/application/ports/ai-coach.port';
import type { CoachTone } from '@/domain/entities/user-profile';
import type { AppLocale } from '@/presentation/i18n';
import type { ThemePreference } from '@/presentation/theme/resolve-theme';

export type OnboardingStep =
  | 'welcome'
  | 'approach'
  | 'identity'
  | 'habits'
  | 'barrier'
  | 'tone'
  | 'notifications';

export type OnboardingDraft = {
  approach: ApproachLens;
  language: AppLocale;
  theme: ThemePreference;
  identityGoal: string;
  habitTitles: string[];
  commonBarrier: string;
  defaultTone: CoachTone;
  notifWindow: string | null;
  notifFrequency: number | null;
};

export const ONBOARDING_STEPS: OnboardingStep[] = [
  'welcome',
  'approach',
  'identity',
  'habits',
  'barrier',
  'tone',
  'notifications',
];

export function createOnboardingDraft(): OnboardingDraft {
  return {
    approach: 'universal',
    language: 'en',
    theme: 'auto',
    identityGoal: '',
    habitTitles: [],
    commonBarrier: '',
    defaultTone: 'gentle',
    notifWindow: null,
    notifFrequency: null,
  };
}

export function getNextOnboardingStep(step: OnboardingStep): OnboardingStep | null {
  const index = ONBOARDING_STEPS.indexOf(step);
  if (index < 0 || index >= ONBOARDING_STEPS.length - 1) {
    return null;
  }
  return ONBOARDING_STEPS[index + 1] ?? null;
}

export function getPreviousOnboardingStep(step: OnboardingStep): OnboardingStep | null {
  const index = ONBOARDING_STEPS.indexOf(step);
  if (index <= 0) {
    return null;
  }
  return ONBOARDING_STEPS[index - 1] ?? null;
}

export function canFinishOnboarding(draft: OnboardingDraft): boolean {
  return draft.habitTitles.some((title) => title.trim().length > 0);
}
