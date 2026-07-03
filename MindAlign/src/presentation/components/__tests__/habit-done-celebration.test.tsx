import { render, screen } from '@testing-library/react-native';

import { HabitDoneCelebration } from '@/presentation/components/habit-done-celebration';
import { AppThemeProvider } from '@/presentation/theme/theme-provider';
import { I18nProvider } from '@/presentation/i18n/i18n-provider';

describe('HabitDoneCelebration', () => {
  it('renders streak-based message when visible', async () => {
    await render(
      <AppThemeProvider>
        <I18nProvider locale="tr">
          <HabitDoneCelebration visible streak={7} />
        </I18nProvider>
      </AppThemeProvider>,
    );

    expect(screen.getByTestId('habit-done-celebration')).toBeOnTheScreen();
    expect(screen.getByTestId('habit-celebration-message')).toHaveTextContent('7 gün güçlü!');
    expect(screen.getByTestId('habit-celebration-glow')).toBeOnTheScreen();
  });

  it('renders first-day copy for streak 1', async () => {
    await render(
      <AppThemeProvider>
        <I18nProvider locale="tr">
          <HabitDoneCelebration visible streak={1} />
        </I18nProvider>
      </AppThemeProvider>,
    );

    expect(screen.getByTestId('habit-celebration-message')).toHaveTextContent('1. gün — başladın!');
  });

  it('renders nothing when not visible', async () => {
    await render(
      <AppThemeProvider>
        <I18nProvider locale="tr">
          <HabitDoneCelebration visible={false} streak={3} />
        </I18nProvider>
      </AppThemeProvider>,
    );

    expect(screen.queryByTestId('habit-done-celebration')).toBeNull();
  });
});
