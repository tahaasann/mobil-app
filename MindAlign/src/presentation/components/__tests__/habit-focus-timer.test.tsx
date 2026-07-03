import { act, render, screen, userEvent } from '@testing-library/react-native';

import { HabitFocusTimer } from '@/presentation/components/habit-focus-timer';
import { AppThemeProvider } from '@/presentation/theme/theme-provider';
import { I18nProvider } from '@/presentation/i18n/i18n-provider';

describe('HabitFocusTimer', () => {
  it('starts and stops the countdown', async () => {
    jest.useFakeTimers();

    await render(
      <AppThemeProvider>
        <I18nProvider locale="tr">
          <HabitFocusTimer durationSeconds={10} />
        </I18nProvider>
      </AppThemeProvider>,
    );

    expect(screen.getByTestId('habit-focus-time')).toHaveTextContent('0:10');

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await user.press(screen.getByTestId('habit-focus-start'));

    await act(async () => {
      jest.advanceTimersByTime(3000);
    });
    expect(screen.getByTestId('habit-focus-time')).toHaveTextContent('0:07');

    await user.press(screen.getByTestId('habit-focus-stop'));
    expect(screen.getByTestId('habit-focus-time')).toHaveTextContent('0:10');

    jest.useRealTimers();
  });
});
