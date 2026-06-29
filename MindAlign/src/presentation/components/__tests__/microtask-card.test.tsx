import { render, screen, userEvent } from '@testing-library/react-native';

import { MicroTaskCard } from '@/presentation/components/microtask-card';

describe('MicroTaskCard', () => {
  it('calls rescue and give up handlers', async () => {
    const onComplete = jest.fn();
    const onGiveUp = jest.fn();
    const user = userEvent.setup();

    await render(
      <MicroTaskCard
        barrierLabel="Yorgunluk"
        microTask="2 dakika hazırlık"
        encouragement="Küçük adım yeterli"
        onComplete={onComplete}
        onGiveUp={onGiveUp}
      />,
    );

    await user.press(screen.getByText(/Yaptım \(kurtar\)/i));
    await user.press(screen.getByText(/Vazgeçtim/i));

    expect(onComplete).toHaveBeenCalled();
    expect(onGiveUp).toHaveBeenCalled();
  });
});
