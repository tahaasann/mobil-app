import { fireEvent, screen, userEvent } from '@testing-library/react-native';

import HabitDetailScreen from '@/app/habit/[id]';
import { renderWithProviders } from '../../../__tests__/utils/render-with-providers';

const mockBack = jest.fn();
const mockUpdateHabit = jest.fn();
const mockArchiveHabit = jest.fn();
const mockAddNote = jest.fn();
const mockDeleteNote = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: mockBack, push: jest.fn() }),
  useLocalSearchParams: () => ({ id: 'habit-1' }),
}));

jest.mock('@/presentation/hooks/use-habit-detail', () => ({
  useHabitDetail: () => ({
    detail: {
      habit: {
        id: 'habit-1',
        title: 'Morning walk',
        description: 'Before coffee',
        schedule: 'daily',
        isActive: true,
        sortOrder: 0,
        createdAt: new Date('2026-06-26T00:00:00.000Z'),
      },
      streak: 3,
      days: [{ date: '2026-06-26', status: 'success' }],
      notes: [
        {
          id: 'note-1',
          habitId: 'habit-1',
          content: 'Felt good',
          createdAt: new Date('2026-06-26T00:00:00.000Z'),
        },
      ],
    },
    isLoading: false,
    error: null,
    refresh: jest.fn(),
    updateHabit: mockUpdateHabit.mockResolvedValue(undefined),
    archiveHabit: mockArchiveHabit.mockResolvedValue(undefined),
    addNote: mockAddNote.mockResolvedValue(undefined),
    deleteNote: mockDeleteNote.mockResolvedValue(undefined),
  }),
}));

describe('HabitDetailScreen', () => {
  beforeEach(() => {
    mockBack.mockReset();
    mockUpdateHabit.mockClear();
  });

  it('renders edit fields, streak, notes, and timer', async () => {
    await renderWithProviders(<HabitDetailScreen />);

    expect(screen.getByTestId('habit-detail-screen')).toBeOnTheScreen();
    expect(screen.getByDisplayValue('Morning walk')).toBeOnTheScreen();
    expect(screen.getByDisplayValue('Before coffee')).toBeOnTheScreen();
    expect(screen.getByText('Seri 3')).toBeOnTheScreen();
    expect(screen.getByText('Felt good')).toBeOnTheScreen();
    expect(screen.getByTestId('habit-focus-timer')).toBeOnTheScreen();
  });

  it('saves edited title from detail screen', async () => {
    const user = userEvent.setup();
    await renderWithProviders(<HabitDetailScreen />);

    fireEvent.changeText(screen.getByTestId('habit-detail-title'), 'Evening walk');
    await user.press(screen.getByTestId('habit-detail-save'));

    expect(mockUpdateHabit).toHaveBeenCalledWith({
      title: 'Evening walk',
      description: 'Before coffee',
    });
  });
});
