import { memo, useCallback } from 'react';
import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

type HabitTitleInputProps = Omit<TextInputProps, 'value' | 'onChangeText'> & {
  value: string;
  onChangeText: (text: string) => void;
};

export const HabitTitleInput = memo(function HabitTitleInput({
  value,
  onChangeText,
  placeholder,
  placeholderTextColor = '#9CA3AF',
  accessibilityLabel = 'Habit title',
  ...rest
}: HabitTitleInputProps) {
  const handleChange = useCallback(
    (text: string) => {
      onChangeText(text);
    },
    [onChangeText],
  );

  return (
    <TextInput
      {...rest}
      accessibilityLabel={accessibilityLabel}
      autoCapitalize="sentences"
      autoCorrect
      placeholder={placeholder}
      placeholderTextColor={placeholderTextColor}
      style={styles.input}
      value={value}
      onChangeText={handleChange}
    />
  );
});

const styles = StyleSheet.create({
  input: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    backgroundColor: 'rgba(255,255,255,0.55)',
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1A1A1A',
  },
});
