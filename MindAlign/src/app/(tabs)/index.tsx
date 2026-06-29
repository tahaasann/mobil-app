import { useTranslation } from 'react-i18next';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AddHabitForm } from '@/presentation/components/add-habit-form';
import { EmptyState, LoadingState } from '@/presentation/components/screen-state';
import { HabitCard } from '@/presentation/components/habit-card';
import { useHabits } from '@/presentation/hooks/use-habits';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { habits, isLoading, createHabit, markDoneToday } = useHabits();

  return (
    <View className="flex-1 bg-ivory dark:bg-charcoal">
      <SafeAreaView className="flex-1 px-4 py-6">
        <Text className="mb-2 text-3xl font-semibold text-foreground dark:text-foreground-dark">
          {t('dashboard.title')}
        </Text>
        <Text className="mb-6 text-base text-muted dark:text-muted-dark">
          {t('dashboard.subtitle')}
        </Text>

        <AddHabitForm onSubmit={createHabit} />

        <ScrollView className="mt-6" contentContainerClassName="gap-4 pb-8">
          {isLoading ? (
            <LoadingState message={t('dashboard.loading')} />
          ) : habits.length === 0 ? (
            <EmptyState title={t('dashboard.empty')} />
          ) : (
            habits.map((item) => (
              <HabitCard key={item.habit.id} item={item} onMarkDone={markDoneToday} />
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
