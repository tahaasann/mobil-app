import { render, screen } from '@testing-library/react-native';

import HomeScreen from '@/app/(tabs)/index';

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

describe('HomeScreen dashboard', () => {
  it('shows empty state when there are no habits', async () => {
    await render(<HomeScreen />);
    expect(screen.getByText(/Henüz alışkanlık yok/i)).toBeOnTheScreen();
  });
});
