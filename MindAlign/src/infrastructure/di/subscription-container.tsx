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
import { MockAdsAdapter } from '@/infrastructure/ads/mock-ads.adapter';
import { isProductionEnv } from '@/infrastructure/config/production-guard';
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
  if (process.env.EXPO_PUBLIC_SUBSCRIPTION_MOCK === 'true') {
    if (isProductionEnv()) {
      throw new Error('EXPO_PUBLIC_SUBSCRIPTION_MOCK is not allowed in production');
    }
    return new MockSubscriptionAdapter();
  }
  if (!process.env.EXPO_PUBLIC_REVENUECAT_API_KEY) {
    if (isProductionEnv()) {
      throw new Error('EXPO_PUBLIC_REVENUECAT_API_KEY is required in production');
    }
    return new MockSubscriptionAdapter();
  }
  return new RevenueCatSubscriptionAdapter();
}

function createAdsPort(): AdsPort {
  // AdMob su an tamamen devre disi. Reklam entegrasyonu (react-native-google-mobile-ads)
  // ileride tekrar eklenecek. Simdilik her zaman mock reklam adapteri kullaniliyor.
  return new MockAdsAdapter();
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
