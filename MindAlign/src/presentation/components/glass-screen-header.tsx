import { Text, View } from 'react-native';

import { GlassCard } from '@/presentation/components/glass-card';

type GlassScreenHeaderProps = {
  title: string;
  subtitle?: string;
};

export function GlassScreenHeader({ title, subtitle }: GlassScreenHeaderProps) {
  return (
    <GlassCard variant="subtle" className="mb-6 px-4 py-5">
      <Text className="text-3xl font-semibold text-foreground dark:text-foreground-dark">
        {title}
      </Text>
      {subtitle ? (
        <Text className="mt-1 text-base text-muted dark:text-muted-dark">{subtitle}</Text>
      ) : null}
    </GlassCard>
  );
}
