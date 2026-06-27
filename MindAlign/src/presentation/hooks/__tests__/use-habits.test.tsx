import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { useHabits } from '@/presentation/hooks/use-habits';

jest.mock('drizzle-orm/expo-sqlite', () => {
  const mockLiveQueryResult = { data: [] as unknown[] };
  return {
    useLiveQuery: () => mockLiveQueryResult,
  };
});

const mockGetDashboard = {
  execute: jest.fn().mockResolvedValue({
    habits: [
      {
        habit: {
          id: 'habit-1',
          title: 'Meditate',
          description: null,
          schedule: 'daily',
          isActive: true,
          sortOrder: 0,
          createdAt: new Date(),
        },
        streak: 1,
        days: [],
      },
    ],
  }),
};

jest.mock('@/infrastructure/di/app-container', () => ({
  useAppContainer: () => ({
    getDashboardUseCase: mockGetDashboard,
    createHabitUseCase: { execute: jest.fn() },
    logHabitUseCase: { execute: jest.fn() },
  }),
}));

jest.mock('@/infrastructure/database/database-provider', () => ({
  useAppDatabase: () => ({
    select: jest.fn().mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn(),
      }),
    }),
  }),
}));

function Probe() {
  const { habits, isLoading } = useHabits();

  if (isLoading) {
    return <Text>loading</Text>;
  }

  return <Text>{habits[0]?.habit.title ?? 'empty'}</Text>;
}

describe('useHabits', () => {
  it('loads dashboard habits', async () => {
    await render(<Probe />);
    expect(await screen.findByText('Meditate', {}, { timeout: 3000 })).toBeOnTheScreen();
  });
});
