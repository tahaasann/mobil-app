import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { GlassCard } from '@/presentation/components/glass-card';

type ProfileSectionCardProps = {
  title: string;
  testID: string;
  children: ReactNode;
};

export function ProfileSectionCard({ title, testID, children }: ProfileSectionCardProps) {
  return (
    <GlassCard testID={testID} variant="elevated" className="gap-1 p-4">
      <Text className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted dark:text-muted-dark">
        {title}
      </Text>
      <View className="gap-1">{children}</View>
    </GlassCard>
  );
}
