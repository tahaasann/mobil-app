import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { DashboardHabit } from '@/application/use-cases/get-dashboard.use-case';
import {
  HABIT_ACCENT_BORDER_CLASS,
  resolveHabitAccentFromSortOrder,
} from '@/domain/entities/habit-accent';
import { GlassCard } from '@/presentation/components/glass-card';
import { GlassPressable } from '@/presentation/components/glass-pressable';
import { HabitDoneCelebration } from '@/presentation/components/habit-done-celebration';
import { resolveCelebrationStreak } from '@/presentation/habits/celebration-message';

type HabitCardProps = {
  item: DashboardHabit;
  onMarkDone: (habitId: string) => Promise<void>;
};

const STATUS_CLASS: Record<'success' | 'rescued' | 'failed' | 'empty', string> = {
  success: 'bg-emerald-500',
  rescued: 'bg-amber-400',
  failed: 'bg-red-500',
  empty: 'bg-gray-200/80 dark:bg-gray-700/80',
};

export function HabitCard({ item, onMarkDone }: HabitCardProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [celebrating, setCelebrating] = useState(false);
  const [celebrationStreak, setCelebrationStreak] = useState(1);
  const accent = resolveHabitAccentFromSortOrder(item.habit.sortOrder);
  const accentBorder = HABIT_ACCENT_BORDER_CLASS[accent];
  const todayAlreadyDone = item.days.at(-1)?.status === 'success';

  const handleMarkDone = async () => {
    await onMarkDone(item.habit.id);
    setCelebrationStreak(resolveCelebrationStreak(item.streak, todayAlreadyDone));
    setCelebrating(true);
    setTimeout(() => setCelebrating(false), 1800);
  };

  return (
    <GlassCard variant="elevated" className={`relative p-4 ${accentBorder}`}>
      <View className="mb-3 flex-row items-start justify-between gap-3">
        <GlassPressable
          accessibilityRole="button"
          accessibilityLabel={t('habitDetail.open')}
          className="flex-1"
          testID={`habit-card-open-${item.habit.id}`}
          onPress={() => router.push(`/habit/${item.habit.id}`)}
        >
          <View className="flex-1">
            <Text className="text-lg font-semibold text-foreground dark:text-foreground-dark">
              {item.habit.title}
            </Text>
            {item.habit.description ? (
              <Text className="mt-1 text-sm text-muted dark:text-muted-dark">
                {item.habit.description}
              </Text>
            ) : null}
          </View>
        </GlassPressable>
        <Text className="text-sm font-medium text-muted dark:text-muted-dark">
          {t('habit.streak', { count: item.streak })}
        </Text>
      </View>

      <View className="mb-4 flex-row gap-2">
        {item.days.map((day) => {
          const statusKey = day.status ?? 'empty';
          return (
            <View
              key={day.date}
              accessibilityLabel={`${day.date} ${day.status ?? 'empty'}`}
              className={`h-4 w-4 rounded-full ${STATUS_CLASS[statusKey]}`}
            />
          );
        })}
      </View>

      <HabitDoneCelebration visible={celebrating} streak={celebrationStreak} />

      <GlassPressable
        accessibilityRole="button"
        accessibilityLabel={t('habit.markDone')}
        className="rounded-xl bg-emerald-600 px-4 py-3"
        onPress={() => void handleMarkDone()}
      >
        <Text className="text-center text-sm font-semibold text-white">{t('habit.markDone')}</Text>
      </GlassPressable>

      <GlassPressable
        accessibilityRole="button"
        accessibilityLabel={t('habit.couldntDo')}
        className="mt-2 rounded-xl bg-amber-500 px-4 py-3"
        onPress={() =>
          router.push(
            `/excuse/${item.habit.id}?title=${encodeURIComponent(item.habit.title)}&streak=${item.streak}` as Href,
          )
        }
      >
        <Text className="text-center text-sm font-semibold text-white">{t('habit.couldntDo')}</Text>
      </GlassPressable>
    </GlassCard>
  );
}
