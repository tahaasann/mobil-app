import { screen, userEvent } from '@testing-library/react-native';

import AuthScreen from '@/app/auth/index';
import { renderWithProviders } from '../../../__tests__/utils/render-with-providers';

const mockReplace = jest.fn();
const mockSignInAsGuest = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

jest.mock('@/infrastructure/firebase/auth-provider', () => ({
  useAuth: () => ({
    signInAsGuest: mockSignInAsGuest,
    signInWithEmail: jest.fn(),
  }),
}));

describe('AuthScreen', () => {
  beforeEach(() => {
    mockReplace.mockReset();
    mockSignInAsGuest.mockReset();
    mockSignInAsGuest.mockResolvedValue(undefined);
  });

  it('signs in as guest and navigates to tabs', async () => {
    const user = userEvent.setup();
    await renderWithProviders(<AuthScreen />);

    expect(screen.getByText('İlerlemeni kaydet')).toBeOnTheScreen();
    await user.press(screen.getByText('Misafir devam et'));

    expect(mockSignInAsGuest).toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
  });
});
