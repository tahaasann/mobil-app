import type { ReactNode } from 'react';
import { Text } from 'react-native';

import { GlassPressable } from '@/presentation/components/glass-pressable';

type ProfileActionRowProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  tone?: 'default' | 'danger';
  testID?: string;
  icon?: ReactNode;
};

export function ProfileActionRow({
  label,
  onPress,
  disabled,
  tone = 'default',
  testID,
}: ProfileActionRowProps) {
  const textClass =
    tone === 'danger'
      ? 'text-base font-medium text-red-600'
      : 'text-base font-medium text-accent';

  return (
    <GlassPressable
      accessibilityRole="button"
      testID={testID}
      className="rounded-xl px-1 py-3"
      disabled={disabled}
      onPress={onPress}
    >
      <Text className={textClass}>{label}</Text>
    </GlassPressable>
  );
}
