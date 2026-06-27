import Purchases, { type CustomerInfo, type PurchasesPackage } from 'react-native-purchases';

import type {
  EntitlementStatus,
  SubscriptionOffering,
  SubscriptionPackage,
  SubscriptionPort,
} from '@/application/ports/subscription.port';

const ENTITLEMENT_ID = 'plus';

function mapPackage(pkg: PurchasesPackage): SubscriptionPackage {
  const period = pkg.packageType === 'ANNUAL' ? 'annual' : 'monthly';

  return {
    identifier: pkg.identifier,
    title: pkg.product.title,
    price: pkg.product.priceString,
    period,
    hasTrial: pkg.product.introPrice !== null,
  };
}

function isPremiumFromCustomerInfo(info: CustomerInfo): boolean {
  return info.entitlements.active[ENTITLEMENT_ID] !== undefined;
}

export class RevenueCatSubscriptionAdapter implements SubscriptionPort {
  private listeners = new Set<(status: EntitlementStatus) => void>();

  async configure(): Promise<void> {
    const apiKey = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY;
    if (!apiKey) {
      return;
    }

    Purchases.addCustomerInfoUpdateListener((info) => {
      this.notify({ isPremium: isPremiumFromCustomerInfo(info) });
    });

    await Purchases.configure({ apiKey });
  }

  async getOfferings(): Promise<SubscriptionOffering | null> {
    const offerings = await Purchases.getOfferings();
    const current = offerings.current;
    if (!current) {
      return null;
    }

    const monthly = current.monthly ? mapPackage(current.monthly) : null;
    const annual = current.annual ? mapPackage(current.annual) : null;

    return {
      identifier: current.identifier,
      monthly,
      annual,
    };
  }

  async purchase(packageIdentifier: string): Promise<EntitlementStatus> {
    const offerings = await Purchases.getOfferings();
    const packages = [
      offerings.current?.monthly,
      offerings.current?.annual,
      ...(offerings.current?.availablePackages ?? []),
    ].filter(Boolean) as PurchasesPackage[];

    const selected = packages.find((pkg) => pkg.identifier === packageIdentifier);
    if (!selected) {
      throw new Error(`Package not found: ${packageIdentifier}`);
    }

    const { customerInfo } = await Purchases.purchasePackage(selected);
    const status = { isPremium: isPremiumFromCustomerInfo(customerInfo) };
    this.notify(status);
    return status;
  }

  async restorePurchases(): Promise<EntitlementStatus> {
    const customerInfo = await Purchases.restorePurchases();
    const status = { isPremium: isPremiumFromCustomerInfo(customerInfo) };
    this.notify(status);
    return status;
  }

  async getEntitlement(): Promise<EntitlementStatus> {
    const customerInfo = await Purchases.getCustomerInfo();
    return { isPremium: isPremiumFromCustomerInfo(customerInfo) };
  }

  onEntitlementChanged(callback: (status: EntitlementStatus) => void): () => void {
    this.listeners.add(callback);
    void this.getEntitlement().then(callback);
    return () => this.listeners.delete(callback);
  }

  private notify(status: EntitlementStatus): void {
    for (const listener of this.listeners) {
      listener(status);
    }
  }
}
