import {
  MockSubscriptionAdapter,
  resetMockSubscriptionAdapter,
} from '@/infrastructure/subscriptions/mock-subscription.adapter';

describe('MockSubscriptionAdapter', () => {
  it('returns mock offerings and toggles premium on purchase', async () => {
    const adapter = new MockSubscriptionAdapter();

    await expect(adapter.getOfferings()).resolves.toEqual(
      expect.objectContaining({ identifier: 'default' }),
    );
    await expect(adapter.getEntitlement()).resolves.toEqual({ isPremium: false });

    await adapter.purchase('mindalign_plus_monthly');
    await expect(adapter.getEntitlement()).resolves.toEqual({ isPremium: true });
    await expect(adapter.restorePurchases()).resolves.toEqual({ isPremium: true });
  });

  it('notifies entitlement listeners', async () => {
    const adapter = new MockSubscriptionAdapter();
    const listener = jest.fn();

    const unsubscribe = adapter.onEntitlementChanged(listener);
    await Promise.resolve();
    expect(listener).toHaveBeenCalledWith({ isPremium: false });

    adapter.setPremium(true);
    expect(listener).toHaveBeenCalledWith({ isPremium: true });

    unsubscribe();
    resetMockSubscriptionAdapter(adapter);
    await expect(adapter.getEntitlement()).resolves.toEqual({ isPremium: false });
  });
});
