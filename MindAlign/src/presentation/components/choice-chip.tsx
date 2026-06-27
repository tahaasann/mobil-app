import { Pressable, Text } from 'react-native';

import { GlassCard } from '@/presentation/components/glass-card';

type ChoiceChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

export function ChoiceChip({ label, selected, onPress }: ChoiceChipProps) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress}>
      <GlassCard className={`mb-2 px-4 py-3 ${selected ? 'border-accent' : ''}`}>
        <Text className="text-base text-foreground dark:text-foreground-dark">{label}</Text>
      </GlassCard>
    </Pressable>
  );
}
