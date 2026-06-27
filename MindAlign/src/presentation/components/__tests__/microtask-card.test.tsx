import { fireEvent, render, screen } from '@testing-library/react-native';

import { MicroTaskCard } from '@/presentation/components/microtask-card';

describe('MicroTaskCard', () => {
  it('calls rescue and give up handlers', async () => {
    const onComplete = jest.fn();
    const onGiveUp = jest.fn();

    await render(
      <MicroTaskCard
        barrierLabel="Yorgunluk"
        microTask="2 dakika hazırlık"
        encouragement="Küçük adım yeterli"
        onComplete={onComplete}
        onGiveUp={onGiveUp}
      />,
    );

    fireEvent.press(screen.getByText(/Yaptım \(kurtar\)/i));
    fireEvent.press(screen.getByText(/Vazgeçtim/i));

    expect(onComplete).toHaveBeenCalled();
    expect(onGiveUp).toHaveBeenCalled();
  });
});
