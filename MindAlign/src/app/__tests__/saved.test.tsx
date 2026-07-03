import { screen } from '@testing-library/react-native';

import SavedScreen from '@/app/(tabs)/saved';
import { renderWithProviders } from '../../../__tests__/utils/render-with-providers';

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn(), push: jest.fn() }),
}));

jest.mock('@/presentation/hooks/use-bookmarks', () => ({
  useBookmarks: () => ({
    bookmarks: [
      {
        id: 'b-1',
        habitId: 'habit-1',
        habitTitle: 'Walk',
        content: 'Start with two minutes indoors.',
        barrierLabel: 'Tired',
        microTask: 'Walk indoors',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    isLoading: false,
    refresh: jest.fn(),
    removeBookmark: jest.fn(),
  }),
}));

describe('SavedScreen', () => {
  it('lists saved coach responses', async () => {
    await renderWithProviders(<SavedScreen />, { locale: 'en' });

    expect(screen.getByText('Saved responses')).toBeOnTheScreen();
    expect(screen.getByText('Start with two minutes indoors.')).toBeOnTheScreen();
  });
});
