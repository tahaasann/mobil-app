import { screen, userEvent } from '@testing-library/react-native';

import ChatTabScreen from '@/app/(tabs)/chat';
import { renderWithProviders } from '../../../__tests__/utils/render-with-providers';

const mockPush = jest.fn();
const mockClearChatThread = jest.fn().mockResolvedValue(undefined);

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, back: jest.fn() }),
}));

jest.mock('@/presentation/hooks/use-habits', () => ({
  useHabits: () => ({
    habits: [],
    isLoading: false,
    createHabit: jest.fn(),
    markDoneToday: jest.fn(),
    refresh: jest.fn(),
  }),
}));

jest.mock('@/infrastructure/di/app-container', () => ({
  useAppContainer: () => ({
    clearChatThreadUseCase: { execute: mockClearChatThread },
  }),
}));

jest.mock('@/presentation/components/coach-chat-view', () => {
  const { Text } = require('react-native');
  return {
    CoachChatView: () => <Text testID="coach-chat-view">Coach chat</Text>,
  };
});

describe('ChatTabScreen', () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockClearChatThread.mockClear();
  });

  it('renders chat header, session controls, topic picker, and coach view', async () => {
    await renderWithProviders(<ChatTabScreen />);

    expect(screen.getByText('Koç sohbeti')).toBeOnTheScreen();
    expect(screen.getByTestId('chat-session-header')).toBeOnTheScreen();
    expect(screen.getByText('Genel konuşma')).toBeOnTheScreen();
    expect(screen.getByTestId('coach-chat-view')).toBeOnTheScreen();
  });

  it('closes chat to home tab', async () => {
    const user = userEvent.setup();
    await renderWithProviders(<ChatTabScreen />);

    await user.press(screen.getByTestId('chat-session-close'));
    expect(mockPush).toHaveBeenCalledWith('/(tabs)/');
  });

  it('starts a new chat thread explicitly', async () => {
    const user = userEvent.setup();
    await renderWithProviders(<ChatTabScreen />);

    await user.press(screen.getByTestId('chat-session-new'));
    expect(mockClearChatThread).toHaveBeenCalledWith('general');
  });
});
