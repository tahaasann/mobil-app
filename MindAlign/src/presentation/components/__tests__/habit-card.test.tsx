import { act, render, screen, userEvent } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';

import type { DashboardHabit } from '@/application/use-cases/get-dashboard.use-case';
import { createHabit } from '@/domain/entities/habit';
import { HabitCard } from '@/presentation/components/habit-card';
import { AppThemeProvider } from '@/presentation/theme/theme-provider';
import { I18nProvider } from '@/presentation/i18n/i18n-provider';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, back: jest.fn() }),
}));

const dashboardItem: DashboardHabit = {
  habit: createHabit({ title: 'Drink water' }),
  streak: 2,
  days: [
    { date: '2026-06-20', status: null },
    { date: '2026-06-21', status: 'success' },
    { date: '2026-06-22', status: 'success' },
    { date: '2026-06-23', status: null },
    { date: '2026-06-24', status: null },
    { date: '2026-06-25', status: null },
    { date: '2026-06-26', status: null },
  ],
};

describe('HabitCard', () => {
  beforeEach(() => {
    mockPush.mockReset();
  });

  it('renders title, streak, and mark done action', async () => {
    const onMarkDone = jest.fn().mockResolvedValue(undefined);
    await render(
      <AppThemeProvider>
        <I18nProvider locale="tr">
          <HabitCard item={dashboardItem} onMarkDone={onMarkDone} />
        </I18nProvider>
      </AppThemeProvider>,
    );

    expect(screen.getByText('Drink water')).toBeOnTheScreen();
    expect(screen.getByText('Seri 2')).toBeOnTheScreen();

    const user = userEvent.setup();
    await user.press(screen.getByText('Yaptım'));
    expect(onMarkDone).toHaveBeenCalledWith(dashboardItem.habit.id);
  });

  it('opens habit detail when title area is pressed', async () => {
    const onMarkDone = jest.fn().mockResolvedValue(undefined);
    await render(
      <AppThemeProvider>
        <I18nProvider locale="tr">
          <HabitCard item={dashboardItem} onMarkDone={onMarkDone} />
        </I18nProvider>
      </AppThemeProvider>,
    );

    const user = userEvent.setup();
    await user.press(screen.getByTestId(`habit-card-open-${dashboardItem.habit.id}`));

    expect(mockPush).toHaveBeenCalledWith(`/habit/${dashboardItem.habit.id}`);
  });

  it('shows celebration overlay and haptic after mark done', async () => {
    jest.useFakeTimers();
    const onMarkDone = jest.fn().mockResolvedValue(undefined);

    await render(
      <AppThemeProvider>
        <I18nProvider locale="tr">
          <HabitCard item={dashboardItem} onMarkDone={onMarkDone} />
        </I18nProvider>
      </AppThemeProvider>,
    );

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await user.press(screen.getByText('Yaptım'));

    expect(onMarkDone).toHaveBeenCalledWith(dashboardItem.habit.id);
    expect(screen.getByTestId('habit-done-celebration')).toBeOnTheScreen();
    expect(screen.getByTestId('habit-celebration-message')).toHaveTextContent('Seri 3 — devam!');
    expect(Haptics.notificationAsync).toHaveBeenCalled();

    await act(async () => {
      jest.advanceTimersByTime(1800);
    });
    expect(screen.queryByTestId('habit-done-celebration')).toBeNull();

    jest.useRealTimers();
  });
});
