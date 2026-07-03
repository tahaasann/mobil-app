import { Alert } from 'react-native';
import { screen, userEvent } from '@testing-library/react-native';

import ProfileScreen from '@/app/(tabs)/profile';
import { renderWithProviders } from '../../../__tests__/utils/render-with-providers';

const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockSignOut = jest.fn();
const mockReplayOnboarding = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace, back: jest.fn() }),
}));

jest.mock('@/presentation/hooks/use-app-settings', () => ({
  useAppSettings: () => ({
    settings: {
      selectedApproach: 'universal',
      language: 'tr',
      theme: 'auto',
      onboardingCompleted: true,
    },
    refresh: jest.fn(),
  }),
}));

jest.mock('@/presentation/hooks/use-profile-summary', () => ({
  useProfileSummary: () => ({
    profile: {
      identityGoal: 'Sakin bir ebeveyn',
      defaultTone: 'gentle',
      commonBarrier: 'tired',
      notifWindow: 'morning',
      notifFrequency: 1,
    },
    summary: {
      habitCount: 2,
      bestStreak: 5,
      activeStreakCount: 1,
    },
    isLoading: false,
    refresh: jest.fn(),
  }),
}));

jest.mock('@/infrastructure/firebase/auth-provider', () => ({
  useAuth: () => ({
    user: { email: 'test@example.com' },
    signOut: mockSignOut,
  }),
}));

jest.mock('@/infrastructure/di/app-container', () => ({
  useAppContainer: () => ({
    updateAppSettingsUseCase: { execute: jest.fn().mockResolvedValue(undefined) },
    exportUserDataUseCase: { execute: jest.fn().mockResolvedValue('{}') },
    resetUserDataUseCase: { execute: jest.fn().mockResolvedValue(undefined) },
    replayOnboardingUseCase: { execute: mockReplayOnboarding.mockResolvedValue(undefined) },
    rescheduleAllNotificationsUseCase: { execute: jest.fn().mockResolvedValue(undefined) },
    requestNotificationPermissionUseCase: { execute: jest.fn().mockResolvedValue(undefined) },
  }),
}));

describe('ProfileScreen', () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockReplace.mockReset();
    mockSignOut.mockReset();
    mockReplayOnboarding.mockReset();
    mockReplayOnboarding.mockResolvedValue(undefined);
  });

  it('renders profile hero, stats, and section layout', async () => {
    await renderWithProviders(<ProfileScreen />);

    expect(screen.getByTestId('profile-hero')).toBeOnTheScreen();
    expect(screen.getByTestId('profile-avatar')).toBeOnTheScreen();
    expect(screen.getByTestId('profile-stats')).toBeOnTheScreen();
    expect(screen.getByTestId('profile-stat-habits')).toHaveTextContent(/2/);
    expect(screen.getByTestId('profile-stat-best-streak')).toHaveTextContent(/5/);
    expect(screen.getByTestId('profile-section-account')).toBeOnTheScreen();
    expect(screen.getByTestId('profile-section-preferences')).toBeOnTheScreen();
    expect(screen.getByTestId('profile-section-tools')).toBeOnTheScreen();
    expect(screen.getByTestId('profile-section-data')).toBeOnTheScreen();
    expect(screen.getByText('Sakin bir ebeveyn')).toBeOnTheScreen();
    expect(screen.getByText('test@example.com')).toBeOnTheScreen();
  });

  it('opens paywall from subscription action', async () => {
    const user = userEvent.setup();
    await renderWithProviders(<ProfileScreen />);

    await user.press(screen.getByText('MindAlign Plus'));
    expect(mockPush).toHaveBeenCalledWith('/paywall?source=settings');
  });

  it('replays onboarding from profile without wiping local data', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation((_title, _message, buttons) => {
      const confirm = buttons?.find((button) => button.text === 'Yeniden oyna');
      confirm?.onPress?.();
    });

    const user = userEvent.setup();
    await renderWithProviders(<ProfileScreen />);

    await user.press(screen.getByText("Onboarding'i yeniden oyna"));

    expect(mockReplayOnboarding).toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith('/onboarding');

    alertSpy.mockRestore();
  });
});
