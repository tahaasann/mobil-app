import { render, screen } from '@testing-library/react-native';

import SavedScreen from '@/app/(tabs)/saved';
import { I18nProvider } from '@/presentation/i18n/i18n-provider';
import { AppThemeProvider } from '@/presentation/theme/theme-provider';

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
    await render(
      <I18nProvider locale="en">
        <AppThemeProvider>
          <SavedScreen />
        </AppThemeProvider>
      </I18nProvider>,
    );

    expect(screen.getByText('Saved responses')).toBeOnTheScreen();
    expect(screen.getByText('Start with two minutes indoors.')).toBeOnTheScreen();
  });
});
