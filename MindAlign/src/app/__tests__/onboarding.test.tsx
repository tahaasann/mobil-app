import { screen, userEvent } from '@testing-library/react-native';

import OnboardingScreen from '@/app/onboarding/index';
import { renderWithProviders } from '../../../__tests__/utils/render-with-providers';

const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

jest.mock('@/infrastructure/di/app-container', () => ({
  useAppContainer: () => ({
    saveOnboardingUseCase: { execute: jest.fn().mockResolvedValue(undefined) },
    requestNotificationPermissionUseCase: { execute: jest.fn().mockResolvedValue(undefined) },
    rescheduleAllNotificationsUseCase: { execute: jest.fn().mockResolvedValue(undefined) },
  }),
}));

jest.mock('@/presentation/notifications/notification-content', () => ({
  createNotificationContentBuilder: () => jest.fn(),
}));

async function finishOnboarding() {
  const user = userEvent.setup();

  await user.press(screen.getByText('Başla'));
  await user.press(screen.getByText('İleri'));
  await user.press(screen.getByText('İleri'));
  await user.type(screen.getByPlaceholderText('Alışkanlık adı'), 'Koşu');
  await user.press(screen.getByText('Ekle'));
  await user.press(screen.getByText('Devam'));
  await user.press(screen.getByText('İleri'));
  await user.press(screen.getByText('İleri'));
  await user.press(screen.getByText('Kurulumu bitir'));
}

describe('OnboardingScreen finish flow', () => {
  beforeEach(() => {
    mockReplace.mockReset();
  });

  it('redirects to auth after onboarding is saved', async () => {
    await renderWithProviders(<OnboardingScreen />);

    await finishOnboarding();

    expect(mockReplace).toHaveBeenCalledWith('/auth');
  });
});
