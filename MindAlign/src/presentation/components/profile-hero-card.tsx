import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { ApproachLens } from '@/application/ports/ai-coach.port';
import { GlassCard } from '@/presentation/components/glass-card';
import { resolveProfileInitials } from '@/presentation/profile/profile-summary';

type ProfileHeroCardProps = {
  email: string | null;
  isGuest: boolean;
  identityGoal: string | null;
  approach: ApproachLens;
};

const APPROACH_KEY: Record<ApproachLens, string> = {
  universal: 'onboarding.approach.universal',
  spiritual: 'onboarding.approach.spiritual',
  scientific: 'onboarding.approach.scientific',
};

export function ProfileHeroCard({ email, isGuest, identityGoal, approach }: ProfileHeroCardProps) {
  const { t } = useTranslation();
  const initials = resolveProfileInitials(email, isGuest);
  const displayName = isGuest ? t('profile.guestBadge') : (email ?? t('settings.guestAccount'));

  return (
    <GlassCard testID="profile-hero" variant="elevated" className="overflow-hidden p-0">
      <View className="bg-accent/10 px-5 pb-5 pt-5">
        <View className="flex-row items-center gap-4">
          <View
            testID="profile-avatar"
            accessibilityLabel={t('profile.avatarLabel', { initials })}
            className="h-16 w-16 items-center justify-center rounded-full border border-white/30 bg-white/50 dark:bg-black/20"
          >
            <Text className="text-2xl font-bold text-accent">{initials}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-xl font-semibold text-foreground dark:text-foreground-dark">
              {displayName}
            </Text>
            <Text className="mt-1 text-sm text-muted dark:text-muted-dark">
              {t('profile.approachLabel')}: {t(APPROACH_KEY[approach])}
            </Text>
          </View>
        </View>
      </View>
      <View className="border-t border-white/15 px-5 py-4 dark:border-white/10">
        <Text className="text-xs font-semibold uppercase tracking-wide text-muted dark:text-muted-dark">
          {t('profile.identityLabel')}
        </Text>
        <Text className="mt-1 text-base text-foreground dark:text-foreground-dark">
          {identityGoal?.trim() ? identityGoal : t('profile.identityEmpty')}
        </Text>
      </View>
    </GlassCard>
  );
}
