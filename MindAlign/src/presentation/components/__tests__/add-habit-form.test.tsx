import { render, screen, userEvent } from '@testing-library/react-native';

import { AddHabitForm } from '@/presentation/components/add-habit-form';
import { I18nProvider } from '@/presentation/i18n/i18n-provider';

describe('AddHabitForm', () => {
  it('validates empty title', async () => {
    const onSubmit = jest.fn();
    await render(
      <I18nProvider locale="tr">
        <AddHabitForm onSubmit={onSubmit} />
      </I18nProvider>,
    );

    const user = userEvent.setup();
    await user.press(screen.getByText('Alışkanlık ekle'));

    expect(screen.getByText('Alışkanlık adı gerekli')).toBeOnTheScreen();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits trimmed title', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    await render(
      <I18nProvider locale="tr">
        <AddHabitForm onSubmit={onSubmit} />
      </I18nProvider>,
    );

    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Habit title'), '  Run  ');
    await user.press(screen.getByText('Alışkanlık ekle'));

    expect(onSubmit).toHaveBeenCalledWith('Run');
  });
});
