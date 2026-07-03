import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { GlassCard } from '@/presentation/components/glass-card';
import type { ProfileSummary } from '@/presentation/profile/profile-summary';

type ProfileStatGridProps = {
  summary: ProfileSummary;
  isLoading?: boolean;
};

function StatTile({ label, value, testID }: { label: string; value: string; testID: string }) {
  return (
    <GlassCard testID={testID} variant="subtle" className="flex-1 items-center px-2 py-4">
      <Text className="text-2xl font-bold text-accent">{value}</Text>
      <Text className="mt-1 text-center text-xs font-medium text-muted dark:text-muted-dark">
        {label}
      </Text>
    </GlassCard>
  );
}

export function ProfileStatGrid({ summary, isLoading }: ProfileStatGridProps) {
  const { t } = useTranslation();

  return (
    <View testID="profile-stats" className="flex-row gap-3">
      <StatTile
        testID="profile-stat-habits"
        label={t('profile.statsHabits')}
        value={isLoading ? '—' : String(summary.habitCount)}
      />
      <StatTile
        testID="profile-stat-best-streak"
        label={t('profile.statsBestStreak')}
        value={isLoading ? '—' : String(summary.bestStreak)}
      />
      <StatTile
        testID="profile-stat-active"
        label={t('profile.statsActive')}
        value={isLoading ? '—' : String(summary.activeStreakCount)}
      />
    </View>
  );
}
