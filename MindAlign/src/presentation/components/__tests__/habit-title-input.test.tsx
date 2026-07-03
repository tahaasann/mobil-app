import { render, screen, userEvent } from '@testing-library/react-native';
import { useState } from 'react';

import { HabitTitleInput } from '@/presentation/components/habit-title-input';

function ControlledInput() {
  const [value, setValue] = useState('Morning walk');

  return <HabitTitleInput value={value} onChangeText={setValue} />;
}

describe('HabitTitleInput', () => {
  it('removes one character at a time on backspace (controlled)', async () => {
    await render(<ControlledInput />);

    expect(screen.getByDisplayValue('Morning walk')).toBeOnTheScreen();

    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Habit title'), '{Backspace}');
    expect(screen.getByDisplayValue('Morning wal')).toBeOnTheScreen();
  });
});
