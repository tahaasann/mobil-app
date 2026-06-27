import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSubscription } from '@/infrastructure/di/subscription-container';
import { PaywallSheet } from '@/presentation/components/paywall-sheet';

export default function PaywallScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ source?: string }>();
  const { offerings, subscriptionPort } = useSubscription();
  const [isBusy, setIsBusy] = useState(false);
  const isOnboarding = params.source === 'onboarding';

  const goNext = () => {
    router.replace(isOnboarding ? ('/auth' as Href) : ('/(tabs)' as Href));
  };

  const handlePurchase = async (packageIdentifier: string) => {
    setIsBusy(true);
    try {
      const result = await subscriptionPort.purchase(packageIdentifier);
      if (result.isPremium) {
        goNext();
      }
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <View className="flex-1 bg-ivory dark:bg-charcoal">
      <SafeAreaView className="flex-1 justify-center px-4 py-6">
        <PaywallSheet
          offering={offerings}
          showContinueFree={isOnboarding}
          isBusy={isBusy}
          onPurchase={(pkg) => void handlePurchase(pkg.identifier)}
          onRestore={() => void subscriptionPort.restorePurchases().then((result) => {
            if (result.isPremium) {
              goNext();
            }
          })}
          onContinueFree={goNext}
        />
      </SafeAreaView>
    </View>
  );
}
