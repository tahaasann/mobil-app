import { render, screen, userEvent } from '@testing-library/react-native';

import { QuotaWall } from '@/presentation/components/quota-wall';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('@/presentation/components/glass-card', () => {
  const { View } = require('react-native');
  return {
    GlassCard: ({ children, testID }: { children: React.ReactNode; testID?: string }) => (
      <View testID={testID}>{children}</View>
    ),
  };
});

describe('QuotaWall', () => {
  it('offers upgrade and rewarded ad actions', async () => {
    const onUpgrade = jest.fn();
    const onWatchAd = jest.fn();
    const user = userEvent.setup();

    await render(<QuotaWall onUpgrade={onUpgrade} onWatchAd={onWatchAd} />);

    expect(screen.getByTestId('quota-wall')).toBeOnTheScreen();
    await user.press(screen.getByText('paywall.upgrade'));
    await user.press(screen.getByText('paywall.watchAd'));
    expect(onUpgrade).toHaveBeenCalled();
    expect(onWatchAd).toHaveBeenCalled();
  });
});
