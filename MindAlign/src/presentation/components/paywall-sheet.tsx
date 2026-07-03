import { Linking, Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type {
  SubscriptionOffering,
  SubscriptionPackage,
} from '@/application/ports/subscription.port';
import { LEGAL_LINKS } from '@/infrastructure/config/legal-links';
import { GlassCard } from '@/presentation/components/glass-card';

export type PaywallLoadState = 'loading' | 'ready' | 'error';

type PaywallSheetProps = {
  offering: SubscriptionOffering | null;
  loadState?: PaywallLoadState;
  showContinueFree?: boolean;
  onPurchase: (pkg: SubscriptionPackage) => void;
  onRestore: () => void;
  onContinueFree?: () => void;
  onRetry?: () => void;
  isBusy?: boolean;
};

function PackageButton({
  pkg,
  onPress,
  disabled,
}: {
  pkg: SubscriptionPackage;
  onPress: () => void;
  disabled?: boolean;
}) {
  const { t } = useTranslation();

  return (
    <Pressable
      accessibilityRole="button"
      className={`rounded-xl bg-accent px-4 py-3 ${disabled ? 'opacity-50' : ''}`}
      disabled={disabled}
      onPress={onPress}
    >
      <Text className="text-center text-base font-semibold text-white">
        {pkg.hasTrial ? t('paywall.startTrial') : t('paywall.subscribe')}
      </Text>
      <Text className="mt-1 text-center text-sm text-white/90">
        {pkg.title} · {pkg.price}
      </Text>
    </Pressable>
  );
}

function LegalFooter() {
  const { t } = useTranslation();

  return (
    <View className="mt-4 gap-2">
      <Text className="text-center text-xs text-muted dark:text-muted-dark">
        {t('paywall.autoRenewal')}
      </Text>
      <View className="flex-row justify-center gap-4">
        <Pressable
          accessibilityRole="link"
          onPress={() => void Linking.openURL(LEGAL_LINKS.termsOfService)}
        >
          <Text className="text-xs font-semibold text-accent">{t('paywall.termsLink')}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="link"
          onPress={() => void Linking.openURL(LEGAL_LINKS.privacyPolicy)}
        >
          <Text className="text-xs font-semibold text-accent">{t('paywall.privacyLink')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function PaywallSheet({
  offering,
  loadState = 'ready',
  showContinueFree = false,
  onPurchase,
  onRestore,
  onContinueFree,
  onRetry,
  isBusy = false,
}: PaywallSheetProps) {
  const { t } = useTranslation();
  const hasPackages = Boolean(offering?.annual || offering?.monthly);
  const showError = loadState === 'error' || (loadState === 'ready' && !hasPackages);

  return (
    <GlassCard testID="paywall-sheet" className="p-6">
      <Text className="text-2xl font-semibold text-foreground dark:text-foreground-dark">
        {t('paywall.title')}
      </Text>
      <Text className="mt-2 text-base text-muted dark:text-muted-dark">
        {t('paywall.subtitle')}
      </Text>

      {showError ? (
        <View className="mt-6">
          <Text className="text-sm text-muted dark:text-muted-dark">
            {t('paywall.offeringError')}
          </Text>
          {onRetry ? (
            <Pressable
              accessibilityRole="button"
              className="mt-4 rounded-xl bg-accent px-4 py-3"
              disabled={isBusy}
              onPress={onRetry}
            >
              <Text className="text-center text-base font-semibold text-white">
                {t('paywall.retry')}
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : (
        <View className="mt-6 gap-3">
          {offering?.annual ? (
            <PackageButton
              pkg={offering.annual}
              disabled={isBusy}
              onPress={() => onPurchase(offering.annual!)}
            />
          ) : null}
          {offering?.monthly ? (
            <PackageButton
              pkg={offering.monthly}
              disabled={isBusy}
              onPress={() => onPurchase(offering.monthly!)}
            />
          ) : null}
        </View>
      )}

      <Pressable
        accessibilityRole="button"
        className="mt-4 py-2"
        disabled={isBusy}
        onPress={onRestore}
      >
        <Text className="text-center text-sm text-accent">{t('paywall.restore')}</Text>
      </Pressable>

      {showContinueFree ? (
        <Pressable
          accessibilityRole="button"
          className="mt-2 py-2"
          disabled={isBusy}
          onPress={onContinueFree}
        >
          <Text className="text-center text-sm text-muted dark:text-muted-dark">
            {t('paywall.continueFree')}
          </Text>
        </Pressable>
      ) : null}

      <LegalFooter />
    </GlassCard>
  );
}
