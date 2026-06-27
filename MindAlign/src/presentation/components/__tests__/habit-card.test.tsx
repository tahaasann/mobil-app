import { render, screen, userEvent } from '@testing-library/react-native';

import type { DashboardHabit } from '@/application/use-cases/get-dashboard.use-case';
import { createHabit } from '@/domain/entities/habit';
import { HabitCard } from '@/presentation/components/habit-card';
import { I18nProvider } from '@/presentation/i18n/i18n-provider';

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
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
  it('renders title, streak, and mark done action', async () => {
    const onMarkDone = jest.fn().mockResolvedValue(undefined);
    await render(
      <I18nProvider locale="tr">
        <HabitCard item={dashboardItem} onMarkDone={onMarkDone} />
      </I18nProvider>,
    );

    expect(screen.getByText('Drink water')).toBeOnTheScreen();
    expect(screen.getByText('Seri 2')).toBeOnTheScreen();

    const user = userEvent.setup();
    await user.press(screen.getByText('Yaptım'));
    expect(onMarkDone).toHaveBeenCalledWith(dashboardItem.habit.id);
  });
});
