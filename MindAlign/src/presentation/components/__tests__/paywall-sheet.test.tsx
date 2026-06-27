import { render, screen, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';

import type { SubscriptionOffering } from '@/application/ports/subscription.port';
import { PaywallSheet } from '@/presentation/components/paywall-sheet';

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

const offering: SubscriptionOffering = {
  identifier: 'default',
  monthly: {
    identifier: 'monthly',
    title: 'Monthly',
    price: '$4.99',
    period: 'monthly',
    hasTrial: true,
  },
  annual: {
    identifier: 'annual',
    title: 'Annual',
    price: '$29.99',
    period: 'annual',
    hasTrial: false,
  },
};

describe('PaywallSheet', () => {
  it('renders packages and continue free action', async () => {
    const onPurchase = jest.fn();
    const onContinueFree = jest.fn();

    await render(
      <PaywallSheet
        offering={offering}
        showContinueFree
        onPurchase={onPurchase}
        onRestore={jest.fn()}
        onContinueFree={onContinueFree}
      />,
    );

    expect(screen.getByTestId('paywall-sheet')).toBeOnTheScreen();
    fireEvent.press(screen.getByText('paywall.startTrial'));
    expect(onPurchase).toHaveBeenCalledWith(offering.monthly);
    fireEvent.press(screen.getByText('paywall.continueFree'));
    expect(onContinueFree).toHaveBeenCalled();
  });
});
