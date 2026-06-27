import { render, screen, userEvent } from '@testing-library/react-native';

import { AddHabitForm } from '@/presentation/components/add-habit-form';

describe('AddHabitForm', () => {
  it('validates empty title', async () => {
    const onSubmit = jest.fn();
    await render(<AddHabitForm onSubmit={onSubmit} />);

    const user = userEvent.setup();
    await user.press(screen.getByText('Ekle'));

    expect(screen.getByText('Alışkanlık adı gerekli')).toBeOnTheScreen();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits trimmed title', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    await render(<AddHabitForm onSubmit={onSubmit} />);

    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Habit title'), '  Run  ');
    await user.press(screen.getByText('Ekle'));

    expect(onSubmit).toHaveBeenCalledWith('Run');
  });
});
