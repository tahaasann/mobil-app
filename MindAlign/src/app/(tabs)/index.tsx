import { useRouter, type Href } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { AddHabitForm } from '@/presentation/components/add-habit-form';
import { EmptyState, LoadingState } from '@/presentation/components/screen-state';
import { HabitCard } from '@/presentation/components/habit-card';
import { useHabits } from '@/presentation/hooks/use-habits';

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { habits, isLoading, createHabit, markDoneToday } = useHabits();

  return (
    <View className="flex-1 bg-ivory dark:bg-charcoal">
      <SafeAreaView className="flex-1 px-4 py-6">
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="text-3xl font-semibold text-foreground dark:text-foreground-dark">
            {t('dashboard.title')}
          </Text>
          <View className="flex-row gap-4">
            <Pressable accessibilityRole="button" onPress={() => router.push('/(tabs)/saved' as Href)}>
              <Text className="text-sm font-semibold text-accent">{t('saved.link')}</Text>
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel={t('settings.link')} onPress={() => router.push('/(tabs)/settings' as Href)}>
              <Text className="text-sm font-semibold text-accent">{t('settings.link')}</Text>
            </Pressable>
          </View>
        </View>
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
