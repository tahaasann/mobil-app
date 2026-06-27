import { SaveOnboardingUseCase } from '@/application/use-cases/save-onboarding.use-case';
import type { CreateHabitUseCase } from '@/application/use-cases/create-habit.use-case';

describe('SaveOnboardingUseCase', () => {
  it('persists settings, profile, and starter habits', async () => {
    const settingsRepository = {
      get: jest.fn().mockResolvedValue(null),
      save: jest.fn().mockResolvedValue(undefined),
    };
    const userProfileRepository = {
      get: jest.fn().mockResolvedValue(null),
      save: jest.fn().mockResolvedValue(undefined),
    };
    const createHabitUseCase = {
      execute: jest.fn().mockResolvedValue(undefined),
    } as unknown as CreateHabitUseCase;

    const useCase = new SaveOnboardingUseCase(
      settingsRepository,
      userProfileRepository,
      createHabitUseCase,
    );

    await useCase.execute({
      approach: 'spiritual',
      language: 'tr',
      theme: 'auto',
      identityGoal: 'Calm parent',
      defaultTone: 'gentle',
      commonBarrier: 'no_time',
      notifWindow: 'morning',
      notifFrequency: 1,
      habitTitles: ['Meditate', ' '],
    });

    expect(settingsRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        selectedApproach: 'spiritual',
        language: 'tr',
        onboardingCompleted: true,
      }),
    );
    expect(userProfileRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        identityGoal: 'Calm parent',
        commonBarrier: 'no_time',
        notifWindow: 'morning',
      }),
    );
    expect(createHabitUseCase.execute).toHaveBeenCalledTimes(1);
    expect(createHabitUseCase.execute).toHaveBeenCalledWith({ title: 'Meditate' });
  });
});
