import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { GlassCard } from '@/presentation/components/glass-card';

type QuotaWallProps = {
  onUpgrade: () => void;
  onWatchAd: () => void;
  isBusy?: boolean;
  watchAdEnabled?: boolean;
};

export function QuotaWall({
  onUpgrade,
  onWatchAd,
  isBusy = false,
  watchAdEnabled = false,
}: QuotaWallProps) {
  const { t } = useTranslation();

  return (
    <GlassCard testID="quota-wall" className="mt-4 p-4">
      <Text className="text-base font-semibold text-foreground dark:text-foreground-dark">
        {t('paywall.quotaTitle')}
      </Text>
      <Text className="mt-2 text-sm text-muted dark:text-muted-dark">
        {t('paywall.quotaSubtitle')}
      </Text>

      <View className="mt-4 gap-3">
        <Pressable
          accessibilityRole="button"
          className={`rounded-xl bg-accent px-4 py-3 ${isBusy ? 'opacity-50' : ''}`}
          disabled={isBusy}
          onPress={onUpgrade}
        >
          <Text className="text-center text-base font-semibold text-white">
            {t('paywall.upgrade')}
          </Text>
        </Pressable>

        {watchAdEnabled ? (
          <Pressable
            accessibilityRole="button"
            className={`rounded-xl border border-accent px-4 py-3 ${isBusy ? 'opacity-50' : ''}`}
            disabled={isBusy}
            onPress={onWatchAd}
          >
            <Text className="text-center text-base font-semibold text-accent">
              {t('paywall.watchAd')}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </GlassCard>
  );
}
