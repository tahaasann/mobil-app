import { useCallback, useState } from 'react';
import { StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import {
  HABIT_ACCENT_OPTIONS,
  type HabitAccent,
} from '@/domain/entities/habit-accent';
import { GlassCard } from '@/presentation/components/glass-card';
import { GlassPressable } from '@/presentation/components/glass-pressable';
import { HabitTitleInput } from '@/presentation/components/habit-title-input';
import type { CreateHabitFormInput } from '@/presentation/habits/create-habit-form.types';

type AddHabitFormProps = {
  onSubmit: (input: CreateHabitFormInput) => Promise<void>;
};

const ACCENT_I18N: Record<HabitAccent, string> = {
  neutral: 'addHabit.accent.neutral',
  emerald: 'addHabit.accent.emerald',
  amber: 'addHabit.accent.amber',
  sky: 'addHabit.accent.sky',
};

const ACCENT_SWATCH: Record<HabitAccent, string> = {
  neutral: '#9CA3AF',
  emerald: '#059669',
  amber: '#D97706',
  sky: '#0284C7',
};

export function AddHabitForm({ onSubmit }: AddHabitFormProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [accent, setAccent] = useState<HabitAccent>('neutral');
  const [enableReminders, setEnableReminders] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const trimmed = title.trim();
    if (!trimmed) {
      setError(t('addHabit.errorRequired', { defaultValue: 'Title is required' }));
      return;
    }

    try {
      setError(null);
      await onSubmit({
        title: trimmed,
        description: description.trim() || undefined,
        accent,
        enableReminders,
      });
      setTitle('');
      setDescription('');
      setAccent('neutral');
      setEnableReminders(true);
    } catch {
      setError(t('addHabit.errorFailed', { defaultValue: 'Could not add habit' }));
    }
  };

  const handleTitleChange = useCallback((text: string) => {
    setTitle(text);
  }, []);

  return (
    <GlassCard testID="add-habit-form" variant="elevated" className="gap-4 p-4">
      <View className="rounded-xl bg-surface/80 p-1 dark:bg-surface-dark/80">
        <HabitTitleInput
          placeholder={t('addHabit.placeholder')}
          value={title}
          onChangeText={handleTitleChange}
        />
      </View>

      <TextInput
        accessibilityLabel={t('addHabit.noteLabel')}
        multiline
        numberOfLines={2}
        placeholder={t('addHabit.notePlaceholder')}
        placeholderTextColor="#9CA3AF"
        style={styles.noteInput}
        value={description}
        onChangeText={setDescription}
      />

      <View>
        <Text className="mb-2 text-sm font-medium text-foreground dark:text-foreground-dark">
          {t('addHabit.accentLabel')}
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {HABIT_ACCENT_OPTIONS.map((option) => {
            const selected = accent === option;
            return (
              <GlassPressable
                key={option}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                testID={`add-habit-accent-${option}`}
                className={`rounded-full border px-3 py-2 ${selected ? 'border-accent bg-accent/10' : 'border-white/20'}`}
                onPress={() => setAccent(option)}
              >
                <View className="flex-row items-center gap-2">
                  <View
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: ACCENT_SWATCH[option] }}
                  />
                  <Text className="text-sm text-foreground dark:text-foreground-dark">
                    {t(ACCENT_I18N[option])}
                  </Text>
                </View>
              </GlassPressable>
            );
          })}
        </View>
      </View>

      <View className="flex-row items-center justify-between rounded-xl bg-white/30 px-3 py-2 dark:bg-black/10">
        <View className="flex-1 pr-3">
          <Text className="text-sm font-medium text-foreground dark:text-foreground-dark">
            {t('addHabit.reminderLabel')}
          </Text>
          <Text className="mt-0.5 text-xs text-muted dark:text-muted-dark">
            {t('addHabit.reminderHint')}
          </Text>
        </View>
        <Switch
          accessibilityLabel={t('addHabit.reminderLabel')}
          value={enableReminders}
          onValueChange={setEnableReminders}
        />
      </View>

      {error ? <Text className="text-sm text-red-600">{error}</Text> : null}

      <GlassPressable
        accessibilityRole="button"
        className="rounded-xl bg-accent px-4 py-3"
        onPress={() => void handleSubmit()}
      >
        <Text className="text-center text-sm font-semibold text-white">{t('addHabit.submit')}</Text>
      </GlassPressable>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  noteInput: {
    minHeight: 72,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.35)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    textAlignVertical: 'top',
    color: '#1A1A1A',
  },
});
