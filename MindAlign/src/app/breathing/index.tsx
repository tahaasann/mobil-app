import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { getBreathingPhaseAt } from '@/domain/breathing/breathing-cycle';
import { BreathingOrb } from '@/presentation/components/breathing-orb';

export default function BreathingRoomScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [elapsedMs, setElapsedMs] = useState(0);
  const phase = getBreathingPhaseAt(elapsedMs);

  useEffect(() => {
    const startedAt = Date.now();
    const timer = setInterval(() => {
      setElapsedMs(Date.now() - startedAt);
    }, 100);

    return () => clearInterval(timer);
  }, []);

  return (
    <View className="flex-1 bg-ivory dark:bg-charcoal">
      <SafeAreaView className="flex-1 items-center justify-center px-4 py-6">
        <Text
          accessibilityRole="header"
          className="mb-2 text-2xl font-semibold text-foreground dark:text-foreground-dark"
        >
          {t('breathing.title')}
        </Text>
        <Text className="mb-10 text-center text-base text-muted dark:text-muted-dark">
          {t('breathing.subtitle')}
        </Text>

        <BreathingOrb elapsedMs={elapsedMs} />

        <Text
          accessibilityLiveRegion="polite"
          className="mt-10 text-xl font-medium text-accent"
        >
          {t(`breathing.phase.${phase.phase}`)}
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('breathing.close')}
          className="mt-12 rounded-xl border border-accent px-6 py-3"
          onPress={() => router.back()}
        >
          <Text className="text-base font-semibold text-accent">{t('breathing.close')}</Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}
