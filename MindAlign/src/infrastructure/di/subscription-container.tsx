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
import { createAdsPort } from '@/infrastructure/ads/create-ads-port';
import { createSubscriptionPort } from '@/infrastructure/subscriptions/create-subscription-port';

type SubscriptionPorts = {
  subscriptionPort: SubscriptionPort;
  adsPort: AdsPort;
};

type SubscriptionContextValue = SubscriptionPorts & {
  isPremium: boolean;
  offerings: SubscriptionOffering | null;
  offeringsLoadState: 'loading' | 'ready' | 'error';
  refreshOfferings: () => Promise<void>;
};

const SubscriptionPortsContext = createContext<SubscriptionPorts | null>(null);
const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

function createAdsPortForContainer(): AdsPort {
  return createAdsPort();
}

export function SubscriptionContainer({ children }: { children: ReactNode }) {
  const ports = useMemo<SubscriptionPorts>(
    () => ({
      subscriptionPort: createSubscriptionPort(),
      adsPort: createAdsPortForContainer(),
    }),
    [],
  );
  const [isPremium, setIsPremium] = useState(false);
  const [offerings, setOfferings] = useState<SubscriptionOffering | null>(null);
  const [offeringsLoadState, setOfferingsLoadState] = useState<'loading' | 'ready' | 'error'>(
    'loading',
  );

  useEffect(() => {
    void ports.subscriptionPort.configure();
  }, [ports.subscriptionPort]);

  useEffect(() => {
    return ports.subscriptionPort.onEntitlementChanged((status) => {
      setIsPremium(status.isPremium);
    });
  }, [ports.subscriptionPort]);

  const refreshOfferings = useCallback(async () => {
    setOfferingsLoadState('loading');
    try {
      const next = await ports.subscriptionPort.getOfferings();
      setOfferings(next);
      setOfferingsLoadState('ready');
    } catch {
      setOfferings(null);
      setOfferingsLoadState('error');
    }
  }, [ports.subscriptionPort]);

  useEffect(() => {
    let cancelled = false;

    void ports.subscriptionPort
      .getOfferings()
      .then((next) => {
        if (!cancelled) {
          setOfferings(next);
          setOfferingsLoadState('ready');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setOfferings(null);
          setOfferingsLoadState('error');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [ports.subscriptionPort]);

  const value = useMemo<SubscriptionContextValue>(
    () => ({
      ...ports,
      isPremium,
      offerings,
      offeringsLoadState,
      refreshOfferings,
    }),
    [ports, isPremium, offerings, offeringsLoadState, refreshOfferings],
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
