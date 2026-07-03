import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AddHabitForm } from '@/presentation/components/add-habit-form';
import { AnimatedEnter } from '@/presentation/components/animated-enter';
import { GlassScreenHeader } from '@/presentation/components/glass-screen-header';
import { EmptyState, LoadingState } from '@/presentation/components/screen-state';
import { HabitCard } from '@/presentation/components/habit-card';
import { useHabits } from '@/presentation/hooks/use-habits';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { habits, isLoading, createHabit, markDoneToday } = useHabits();

  return (
    <View className="flex-1 bg-ivory dark:bg-charcoal">
      <View className="pointer-events-none absolute -right-16 top-24 h-56 w-56 rounded-full bg-accent/10" />
      <View className="pointer-events-none absolute -left-20 bottom-32 h-48 w-48 rounded-full bg-emerald-400/10" />

      <SafeAreaView className="flex-1 px-4 py-6">
        <GlassScreenHeader title={t('dashboard.title')} subtitle={t('dashboard.subtitle')} />

        <AddHabitForm onSubmit={createHabit} />

        <ScrollView className="mt-6" contentContainerClassName="gap-4 pb-28">
          {isLoading ? (
            <LoadingState message={t('dashboard.loading')} />
          ) : habits.length === 0 ? (
            <EmptyState title={t('dashboard.empty')} />
          ) : (
            habits.map((item, index) => (
              <AnimatedEnter key={item.habit.id} index={index}>
                <HabitCard item={item} onMarkDone={markDoneToday} />
              </AnimatedEnter>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
