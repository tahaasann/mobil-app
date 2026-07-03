import {
  mapIntroPriceToTrialFlag,
  packageHasFreeTrial,
} from '@/infrastructure/subscriptions/subscription-package-mapper';

describe('subscription package mapper (T-216 trial label)', () => {
  it('does not treat discounted intro price as a free trial', () => {
    expect(packageHasFreeTrial({ price: 0.99 })).toBe(false);
    expect(mapIntroPriceToTrialFlag({ price: 0.99 })).toBe(false);
  });

  it('treats zero-price intro as a free trial', () => {
    expect(packageHasFreeTrial({ price: 0 })).toBe(true);
    expect(mapIntroPriceToTrialFlag({ price: 0 })).toBe(true);
  });

  it('does not show trial when intro price is absent', () => {
    expect(packageHasFreeTrial(null)).toBe(false);
  });
});
