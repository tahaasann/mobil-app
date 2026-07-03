import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { GlassPressable } from '@/presentation/components/glass-pressable';
import { GlassScreenHeader } from '@/presentation/components/glass-screen-header';
import { HabitFocusTimer } from '@/presentation/components/habit-focus-timer';
import { HabitNotesSection } from '@/presentation/components/habit-notes-section';
import { HabitTitleInput } from '@/presentation/components/habit-title-input';
import { EmptyState, LoadingState } from '@/presentation/components/screen-state';
import { useHabitDetail } from '@/presentation/hooks/use-habit-detail';

const STATUS_CLASS: Record<'success' | 'rescued' | 'failed' | 'empty', string> = {
  success: 'bg-emerald-500',
  rescued: 'bg-amber-400',
  failed: 'bg-red-500',
  empty: 'bg-gray-200/80 dark:bg-gray-700/80',
};

export default function HabitDetailScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ id: string }>();
  const habitId = params.id ?? '';
  const { detail, isLoading, error, updateHabit, archiveHabit, addNote, deleteNote } =
    useHabitDetail(habitId);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!detail) {
      return;
    }

    setTitle(detail.habit.title);
    setDescription(detail.habit.description ?? '');
  }, [detail?.habit.id, detail?.habit.title, detail?.habit.description]);

  const handleSave = async () => {
    if (!detail || isSaving) {
      return;
    }

    setIsSaving(true);
    try {
      await updateHabit({ title, description });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(t('habitDetail.deleteTitle'), t('habitDetail.deleteConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('habitDetail.deleteAction'),
        style: 'destructive',
        onPress: () => {
          void archiveHabit().then(() => router.back());
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-ivory dark:bg-charcoal">
        <SafeAreaView className="flex-1 px-4 py-6">
          <LoadingState message={t('habitDetail.loading')} />
        </SafeAreaView>
      </View>
    );
  }

  if (error || !detail) {
    return (
      <View className="flex-1 bg-ivory dark:bg-charcoal">
        <SafeAreaView className="flex-1 px-4 py-6">
          <EmptyState title={t('habitDetail.notFound')} />
          <GlassPressable
            accessibilityRole="button"
            className="mt-4 rounded-xl bg-accent px-4 py-3"
            testID="habit-detail-back"
            onPress={() => router.back()}
          >
            <Text className="text-center text-sm font-semibold text-white">
              {t('habitDetail.back')}
            </Text>
          </GlassPressable>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-ivory dark:bg-charcoal">
      <SafeAreaView className="flex-1 px-4 py-6">
        <ScrollView contentContainerClassName="gap-4 pb-10" testID="habit-detail-screen">
          <GlassPressable
            accessibilityRole="button"
            accessibilityLabel={t('habitDetail.back')}
            className="self-start rounded-lg px-2 py-1"
            testID="habit-detail-back"
            onPress={() => router.back()}
          >
            <Text className="text-sm font-medium text-accent">{t('habitDetail.back')}</Text>
          </GlassPressable>

          <GlassScreenHeader
            title={t('habitDetail.title')}
            subtitle={t('habit.streak', { count: detail.streak })}
          />

          <View className="gap-3">
            <Text className="text-sm font-medium text-muted dark:text-muted-dark">
              {t('habitDetail.editTitle')}
            </Text>
            <HabitTitleInput
              accessibilityLabel={t('habitDetail.editTitle')}
              testID="habit-detail-title"
              value={title}
              onChangeText={setTitle}
            />

            <Text className="text-sm font-medium text-muted dark:text-muted-dark">
              {t('habitDetail.editDescription')}
            </Text>
            <TextInput
              accessibilityLabel={t('habitDetail.editDescription')}
              multiline
              placeholder={t('addHabit.notePlaceholder')}
              placeholderTextColor="#9CA3AF"
              style={styles.descriptionInput}
              testID="habit-detail-description"
              value={description}
              onChangeText={setDescription}
            />

            <GlassPressable
              accessibilityRole="button"
              accessibilityLabel={t('habitDetail.save')}
              className="rounded-xl bg-emerald-600 px-4 py-3"
              disabled={!title.trim() || isSaving}
              testID="habit-detail-save"
              onPress={() => void handleSave()}
            >
              <Text className="text-center text-sm font-semibold text-white">
                {t('habitDetail.save')}
              </Text>
            </GlassPressable>
          </View>

          <View className="flex-row gap-2">
            {detail.days.map((day) => {
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

          <HabitFocusTimer />

          <HabitNotesSection notes={detail.notes} onAddNote={addNote} onDeleteNote={deleteNote} />

          <GlassPressable
            accessibilityRole="button"
            accessibilityLabel={t('habitDetail.deleteAction')}
            className="rounded-xl bg-red-600 px-4 py-3"
            testID="habit-detail-delete"
            onPress={handleDelete}
          >
            <Text className="text-center text-sm font-semibold text-white">
              {t('habitDetail.deleteAction')}
            </Text>
          </GlassPressable>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  descriptionInput: {
    minHeight: 96,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    backgroundColor: 'rgba(255,255,255,0.55)',
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1A1A1A',
    textAlignVertical: 'top',
  },
});
