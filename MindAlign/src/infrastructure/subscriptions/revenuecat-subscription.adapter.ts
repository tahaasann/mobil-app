import { Platform } from 'react-native';
import Purchases, { type CustomerInfo, type PurchasesPackage } from 'react-native-purchases';

import type {
  EntitlementStatus,
  SubscriptionOffering,
  SubscriptionPackage,
  SubscriptionPort,
} from '@/application/ports/subscription.port';
import { resolveRevenueCatApiKey } from '@/infrastructure/subscriptions/resolve-revenuecat-api-key';
import { mapIntroPriceToTrialFlag } from '@/infrastructure/subscriptions/subscription-package-mapper';

const ENTITLEMENT_ID = 'plus';

function getRevenueCatApiKey(): string | undefined {
  if (Platform.OS === 'android') {
    return resolveRevenueCatApiKey('android');
  }

  if (Platform.OS === 'ios') {
    return resolveRevenueCatApiKey('ios');
  }

  return resolveRevenueCatApiKey('default');
}

function mapPackage(pkg: PurchasesPackage): SubscriptionPackage {
  const period = pkg.packageType === 'ANNUAL' ? 'annual' : 'monthly';

  return {
    identifier: pkg.identifier,
    title: pkg.product.title,
    price: pkg.product.priceString,
    period,
    hasTrial: mapIntroPriceToTrialFlag(pkg.product.introPrice),
  };
}

function isPremiumFromCustomerInfo(info: CustomerInfo): boolean {
  return info.entitlements.active[ENTITLEMENT_ID] !== undefined;
}

export class RevenueCatSubscriptionAdapter implements SubscriptionPort {
  private listeners = new Set<(status: EntitlementStatus) => void>();
  private configurePromise: Promise<void> | null = null;

  private async ensureConfigured(): Promise<void> {
    if (this.configurePromise) {
      await this.configurePromise;
      return;
    }

    this.configurePromise = this.configureInternal();
    await this.configurePromise;
  }

  async configure(): Promise<void> {
    await this.ensureConfigured();
  }

  private async configureInternal(): Promise<void> {
    const apiKey = getRevenueCatApiKey();
    if (!apiKey) {
      return;
    }

    Purchases.addCustomerInfoUpdateListener((info) => {
      this.notify({ isPremium: isPremiumFromCustomerInfo(info) });
    });

    await Purchases.configure({ apiKey });
  }

  async identifyUser(userId: string | null): Promise<void> {
    await this.ensureConfigured();
    const apiKey = getRevenueCatApiKey();
    if (!apiKey) {
      return;
    }

    if (userId) {
      await Purchases.logIn(userId);
      return;
    }

    await Purchases.logOut();
  }

  async getOfferings(): Promise<SubscriptionOffering | null> {
    await this.ensureConfigured();
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
    await this.ensureConfigured();
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
    await this.ensureConfigured();
    const customerInfo = await Purchases.restorePurchases();
    const status = { isPremium: isPremiumFromCustomerInfo(customerInfo) };
    this.notify(status);
    return status;
  }

  async getEntitlement(): Promise<EntitlementStatus> {
    await this.ensureConfigured();
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
