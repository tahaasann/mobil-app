import { render, screen, userEvent } from '@testing-library/react-native';
import { Linking } from 'react-native';

import type { SubscriptionOffering } from '@/application/ports/subscription.port';
import { LEGAL_LINKS } from '@/infrastructure/config/legal-links';
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
  beforeEach(() => {
    jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined as never);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders packages and continue free action', async () => {
    const onPurchase = jest.fn();
    const onContinueFree = jest.fn();
    const user = userEvent.setup();

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
    await user.press(screen.getByText('paywall.startTrial'));
    expect(onPurchase).toHaveBeenCalledWith(offering.monthly);
    await user.press(screen.getByText('paywall.subscribe'));
    expect(onPurchase).toHaveBeenCalledWith(offering.annual);
    await user.press(screen.getByText('paywall.continueFree'));
    expect(onContinueFree).toHaveBeenCalled();
  });

  it('shows legal links and auto-renewal copy (T-218)', async () => {
    const user = userEvent.setup();

    await render(<PaywallSheet offering={offering} onPurchase={jest.fn()} onRestore={jest.fn()} />);

    expect(screen.getByText('paywall.autoRenewal')).toBeOnTheScreen();
    await user.press(screen.getByText('paywall.termsLink'));
    await user.press(screen.getByText('paywall.privacyLink'));
    expect(Linking.openURL).toHaveBeenCalledWith(LEGAL_LINKS.termsOfService);
    expect(Linking.openURL).toHaveBeenCalledWith(LEGAL_LINKS.privacyPolicy);
  });

  it('shows offering error state with retry (T-219)', async () => {
    const onRetry = jest.fn();
    const user = userEvent.setup();

    await render(
      <PaywallSheet
        offering={null}
        loadState="error"
        onPurchase={jest.fn()}
        onRestore={jest.fn()}
        onRetry={onRetry}
      />,
    );

    expect(screen.getByText('paywall.offeringError')).toBeOnTheScreen();
    await user.press(screen.getByText('paywall.retry'));
    expect(onRetry).toHaveBeenCalled();
  });
});
