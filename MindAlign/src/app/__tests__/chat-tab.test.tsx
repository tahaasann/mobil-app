import { screen } from '@testing-library/react-native';

import ChatTabScreen from '@/app/(tabs)/chat';
import { renderWithProviders } from '../../../__tests__/utils/render-with-providers';

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
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

jest.mock('@/presentation/components/coach-chat-view', () => {
  const { Text } = require('react-native');
  return {
    CoachChatView: () => <Text testID="coach-chat-view">Coach chat</Text>,
  };
});

describe('ChatTabScreen', () => {
  it('renders chat header, topic picker, and coach view', async () => {
    await renderWithProviders(<ChatTabScreen />);

    expect(screen.getByText('Koç sohbeti')).toBeOnTheScreen();
    expect(screen.getByText('Genel konuşma')).toBeOnTheScreen();
    expect(screen.getByTestId('coach-chat-view')).toBeOnTheScreen();
  });
});
