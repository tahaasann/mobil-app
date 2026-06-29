import { render, screen } from '@testing-library/react-native';

import IndexRoute from '@/app/index';

const mockUseAppSettings = jest.fn();
const mockUseAuth = jest.fn();

jest.mock('@/presentation/hooks/use-app-settings', () => ({
  useAppSettings: () => mockUseAppSettings(),
}));

jest.mock('@/infrastructure/firebase/auth-provider', () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock('expo-router', () => ({
  Redirect: ({ href }: { href: string }) => {
    const { Text } = require('react-native');
    return <Text testID="redirect">{href}</Text>;
  },
}));

describe('IndexRoute', () => {
  beforeEach(() => {
    mockUseAppSettings.mockReset();
    mockUseAuth.mockReset();
  });

  it('shows loading while settings and auth are loading', async () => {
    mockUseAppSettings.mockReturnValue({ settings: null, isLoading: true });
    mockUseAuth.mockReturnValue({ user: null, isLoading: false });

    await render(<IndexRoute />);
    expect(screen.queryByTestId('redirect')).toBeNull();
  });

  it('redirects to onboarding when onboarding is incomplete', async () => {
    mockUseAppSettings.mockReturnValue({
      settings: { onboardingCompleted: false },
      isLoading: false,
    });
    mockUseAuth.mockReturnValue({ user: null, isLoading: false });

    await render(<IndexRoute />);
    expect(screen.getByTestId('redirect')).toHaveTextContent('/onboarding');
  });

  it('redirects to auth when onboarding is done but user is missing', async () => {
    mockUseAppSettings.mockReturnValue({
      settings: { onboardingCompleted: true },
      isLoading: false,
    });
    mockUseAuth.mockReturnValue({ user: null, isLoading: false });

    await render(<IndexRoute />);
    expect(screen.getByTestId('redirect')).toHaveTextContent('/auth');
  });

  it('redirects to tabs when onboarding and auth are ready', async () => {
    mockUseAppSettings.mockReturnValue({
      settings: { onboardingCompleted: true },
      isLoading: false,
    });
    mockUseAuth.mockReturnValue({ user: { uid: 'user-1' }, isLoading: false });

    await render(<IndexRoute />);
    expect(screen.getByTestId('redirect')).toHaveTextContent('/(tabs)');
  });
});
