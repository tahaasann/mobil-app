import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { AdsPort } from '@/application/ports/ads.port';
import type { SubscriptionOffering, SubscriptionPort } from '@/application/ports/subscription.port';
import { AdMobRewardedAdapter } from '@/infrastructure/ads/admob-rewarded.adapter';
import { MockAdsAdapter } from '@/infrastructure/ads/mock-ads.adapter';
import { MockSubscriptionAdapter } from '@/infrastructure/subscriptions/mock-subscription.adapter';
import { RevenueCatSubscriptionAdapter } from '@/infrastructure/subscriptions/revenuecat-subscription.adapter';

type SubscriptionPorts = {
  subscriptionPort: SubscriptionPort;
  adsPort: AdsPort;
};

type SubscriptionContextValue = SubscriptionPorts & {
  isPremium: boolean;
  offerings: SubscriptionOffering | null;
  refreshOfferings: () => Promise<void>;
};

const SubscriptionPortsContext = createContext<SubscriptionPorts | null>(null);
const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

function createSubscriptionPort(): SubscriptionPort {
  if (
    process.env.EXPO_PUBLIC_SUBSCRIPTION_MOCK === 'true' ||
    !process.env.EXPO_PUBLIC_REVENUECAT_API_KEY
  ) {
    return new MockSubscriptionAdapter();
  }
  return new RevenueCatSubscriptionAdapter();
}

function createAdsPort(): AdsPort {
  if (process.env.EXPO_PUBLIC_ADS_MOCK === 'true') {
    return new MockAdsAdapter();
  }
  return new AdMobRewardedAdapter();
}

export function SubscriptionContainer({ children }: { children: ReactNode }) {
  const ports = useMemo<SubscriptionPorts>(
    () => ({
      subscriptionPort: createSubscriptionPort(),
      adsPort: createAdsPort(),
    }),
    [],
  );
  const [isPremium, setIsPremium] = useState(false);
  const [offerings, setOfferings] = useState<SubscriptionOffering | null>(null);

  useEffect(() => {
    void ports.subscriptionPort.configure();
  }, [ports.subscriptionPort]);

  useEffect(() => {
    return ports.subscriptionPort.onEntitlementChanged((status) => {
      setIsPremium(status.isPremium);
    });
  }, [ports.subscriptionPort]);

  useEffect(() => {
    let cancelled = false;

    void ports.subscriptionPort.getOfferings().then((next) => {
      if (!cancelled) {
        setOfferings(next);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [ports.subscriptionPort]);

  const refreshOfferings = useCallback(async () => {
    const next = await ports.subscriptionPort.getOfferings();
    setOfferings(next);
  }, [ports.subscriptionPort]);

  const value = useMemo<SubscriptionContextValue>(
    () => ({
      ...ports,
      isPremium,
      offerings,
      refreshOfferings,
    }),
    [ports, isPremium, offerings, refreshOfferings],
  );

  return (
    <SubscriptionPortsContext.Provider value={ports}>
      <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>
    </SubscriptionPortsContext.Provider>
  );
}

export function useSubscriptionPorts(): SubscriptionPorts {
  const ports = useContext(SubscriptionPortsContext);
  if (!ports) {
    throw new Error('useSubscriptionPorts must be used within SubscriptionContainer');
  }
  return ports;
}

export function useSubscription(): SubscriptionContextValue {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionContainer');
  }
  return context;
}
