import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';

type AddHabitFormProps = {
  onSubmit: (title: string) => Promise<void>;
};

export function AddHabitForm({ onSubmit }: AddHabitFormProps) {
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const trimmed = title.trim();
    if (!trimmed) {
      setError('Alışkanlık adı gerekli');
      return;
    }

    try {
      setError(null);
      await onSubmit(trimmed);
      setTitle('');
    } catch {
      setError('Alışkanlık eklenemedi');
    }
  };

  return (
    <View className="gap-2">
      <TextInput
        accessibilityLabel="Habit title"
        className="rounded-lg border border-gray-300 px-3 py-2 text-base text-foreground dark:text-foreground-dark"
        placeholder="Yeni alışkanlık"
        value={title}
        onChangeText={setTitle}
      />
      {error ? <Text className="text-sm text-red-600">{error}</Text> : null}
      <Text
        accessibilityRole="button"
        className="rounded-lg bg-accent px-4 py-2 text-center text-sm font-semibold text-white"
        onPress={() => void handleSubmit()}
      >
        Ekle
      </Text>
    </View>
  );
}
