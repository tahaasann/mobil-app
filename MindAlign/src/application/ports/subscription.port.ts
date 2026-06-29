export type SubscriptionPackage = {
  identifier: string;
  title: string;
  price: string;
  period: 'monthly' | 'annual';
  hasTrial: boolean;
};

export type SubscriptionOffering = {
  identifier: string;
  monthly: SubscriptionPackage | null;
  annual: SubscriptionPackage | null;
};

export type EntitlementStatus = {
  isPremium: boolean;
};

export type SubscriptionPort = {
  configure(): Promise<void>;
  identifyUser(userId: string | null): Promise<void>;
  getOfferings(): Promise<SubscriptionOffering | null>;
  purchase(packageIdentifier: string): Promise<EntitlementStatus>;
  restorePurchases(): Promise<EntitlementStatus>;
  getEntitlement(): Promise<EntitlementStatus>;
  onEntitlementChanged(callback: (status: EntitlementStatus) => void): () => void;
};
