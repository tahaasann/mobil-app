import { screen, userEvent } from '@testing-library/react-native';

import ProfileScreen from '@/app/(tabs)/profile';
import { renderWithProviders } from '../../../__tests__/utils/render-with-providers';

const mockPush = jest.fn();
const mockSignOut = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn(), back: jest.fn() }),
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
    rescheduleAllNotificationsUseCase: { execute: jest.fn().mockResolvedValue(undefined) },
    requestNotificationPermissionUseCase: { execute: jest.fn().mockResolvedValue(undefined) },
  }),
}));

describe('ProfileScreen', () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockSignOut.mockReset();
  });

  it('renders profile sections and opens paywall from subscription action', async () => {
    const user = userEvent.setup();
    await renderWithProviders(<ProfileScreen />);

    expect(screen.getByText('Profil')).toBeOnTheScreen();
    expect(screen.getByText('test@example.com')).toBeOnTheScreen();

    await user.press(screen.getByText('MindAlign Plus'));
    expect(mockPush).toHaveBeenCalledWith('/paywall?source=settings');
  });
});
