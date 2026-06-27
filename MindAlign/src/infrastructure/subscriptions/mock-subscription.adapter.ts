import type {
  EntitlementStatus,
  SubscriptionOffering,
  SubscriptionPort,
} from '@/application/ports/subscription.port';

const MOCK_OFFERING: SubscriptionOffering = {
  identifier: 'default',
  monthly: {
    identifier: 'mindalign_plus_monthly',
    title: 'MindAlign Plus Monthly',
    price: '$4.99',
    period: 'monthly',
    hasTrial: true,
  },
  annual: {
    identifier: 'mindalign_plus_annual',
    title: 'MindAlign Plus Annual',
    price: '$29.99',
    period: 'annual',
    hasTrial: true,
  },
};

export class MockSubscriptionAdapter implements SubscriptionPort {
  private isPremium = false;
  private listeners = new Set<(status: EntitlementStatus) => void>();

  setPremium(value: boolean): void {
    this.isPremium = value;
    this.notify();
  }

  async configure(): Promise<void> {}

  async getOfferings(): Promise<SubscriptionOffering | null> {
    return MOCK_OFFERING;
  }

  async purchase(packageIdentifier: string): Promise<EntitlementStatus> {
    if (
      packageIdentifier === MOCK_OFFERING.monthly?.identifier ||
      packageIdentifier === MOCK_OFFERING.annual?.identifier
    ) {
      this.isPremium = true;
      this.notify();
    }

    return { isPremium: this.isPremium };
  }

  async restorePurchases(): Promise<EntitlementStatus> {
    return { isPremium: this.isPremium };
  }

  async getEntitlement(): Promise<EntitlementStatus> {
    return { isPremium: this.isPremium };
  }

  onEntitlementChanged(callback: (status: EntitlementStatus) => void): () => void {
    this.listeners.add(callback);
    void Promise.resolve().then(() => callback({ isPremium: this.isPremium }));
    return () => this.listeners.delete(callback);
  }

  private notify(): void {
    const status = { isPremium: this.isPremium };
    for (const listener of this.listeners) {
      listener(status);
    }
  }
}

export function resetMockSubscriptionAdapter(adapter: MockSubscriptionAdapter): void {
  adapter.setPremium(false);
}
