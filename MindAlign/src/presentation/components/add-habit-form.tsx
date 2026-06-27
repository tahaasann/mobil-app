import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

type AddHabitFormProps = {
  onSubmit: (title: string) => Promise<void>;
};

export function AddHabitForm({ onSubmit }: AddHabitFormProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const trimmed = title.trim();
    if (!trimmed) {
      setError(t('addHabit.errorRequired', { defaultValue: 'Title is required' }));
      return;
    }

    try {
      setError(null);
      await onSubmit(trimmed);
      setTitle('');
    } catch {
      setError(t('addHabit.errorFailed', { defaultValue: 'Could not add habit' }));
    }
  };

  return (
    <View className="gap-2">
      <TextInput
        accessibilityLabel="Habit title"
        className="rounded-lg border border-gray-300 px-3 py-2 text-base text-foreground dark:text-foreground-dark"
        placeholder={t('addHabit.placeholder')}
        value={title}
        onChangeText={setTitle}
      />
      {error ? <Text className="text-sm text-red-600">{error}</Text> : null}
      <Text
        accessibilityRole="button"
        className="rounded-lg bg-accent px-4 py-2 text-center text-sm font-semibold text-white"
        onPress={() => void handleSubmit()}
      >
        {t('addHabit.submit')}
      </Text>
    </View>
  );
}
