import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { DashboardHabit } from '@/application/use-cases/get-dashboard.use-case';

type HabitCardProps = {
  item: DashboardHabit;
  onMarkDone: (habitId: string) => Promise<void>;
};

const STATUS_CLASS: Record<'success' | 'rescued' | 'failed' | 'empty', string> = {
  success: 'bg-emerald-500',
  rescued: 'bg-amber-400',
  failed: 'bg-red-500',
  empty: 'bg-gray-200 dark:bg-gray-700',
};

export function HabitCard({ item, onMarkDone }: HabitCardProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [celebrating, setCelebrating] = useState(false);

  const handleMarkDone = async () => {
    await onMarkDone(item.habit.id);
    setCelebrating(true);
    setTimeout(() => setCelebrating(false), 1200);
  };

  return (
    <View className="rounded-2xl bg-white/80 p-4 dark:bg-surface-dark">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-lg font-semibold text-foreground dark:text-foreground-dark">
          {item.habit.title}
        </Text>
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

      {celebrating ? (
        <Text className="mb-2 text-center text-sm font-semibold text-emerald-700">Harika!</Text>
      ) : null}

      <Text
        accessibilityRole="button"
        className="rounded-lg bg-emerald-600 px-4 py-2 text-center text-sm font-semibold text-white"
        onPress={() => void handleMarkDone()}
      >
        {t('habit.markDone')}
      </Text>

      <Text
        accessibilityRole="button"
        className="mt-2 rounded-lg bg-amber-500 px-4 py-2 text-center text-sm font-semibold text-white"
        onPress={() =>
          router.push(
            `/excuse/${item.habit.id}?title=${encodeURIComponent(item.habit.title)}&streak=${item.streak}` as Href,
          )
        }
      >
        {t('habit.couldntDo')}
      </Text>
    </View>
  );
}
