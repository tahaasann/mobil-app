import { render, screen, userEvent } from '@testing-library/react-native';

import { AddHabitForm } from '@/presentation/components/add-habit-form';
import { I18nProvider } from '@/presentation/i18n/i18n-provider';
import { AppThemeProvider } from '@/presentation/theme/theme-provider';

function renderForm(onSubmit: (input: {
  title: string;
  description?: string;
  accent?: string;
  enableReminders?: boolean;
}) => Promise<void>) {
  return render(
    <AppThemeProvider>
      <I18nProvider locale="tr">
        <AddHabitForm onSubmit={onSubmit} />
      </I18nProvider>
    </AppThemeProvider>,
  );
}

describe('AddHabitForm', () => {
  it('validates empty title', async () => {
    const onSubmit = jest.fn();
    await renderForm(onSubmit);

    const user = userEvent.setup();
    await user.press(await screen.findByText('Alışkanlık ekle'));

    expect(screen.getByText('Alışkanlık adı gerekli')).toBeOnTheScreen();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits trimmed title with optional fields', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    await renderForm(onSubmit);

    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Habit title'), '  Run  ');
    await user.type(screen.getByLabelText('Alışkanlık notu'), 'Feel stronger');
    await user.press(screen.getByTestId('add-habit-accent-emerald'));
    await user.press(screen.getByText('Alışkanlık ekle'));

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Run',
      description: 'Feel stronger',
      accent: 'emerald',
      enableReminders: true,
    });
  });

  it('deletes title one character at a time without clearing the field', async () => {
    const onSubmit = jest.fn();
    await renderForm(onSubmit);

    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Habit title'), 'Morning');
    expect(screen.getByDisplayValue('Morning')).toBeOnTheScreen();

    await user.type(screen.getByLabelText('Habit title'), '{Backspace}');
    expect(screen.getByDisplayValue('Mornin')).toBeOnTheScreen();
  });
});
