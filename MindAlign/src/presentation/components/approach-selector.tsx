import type { ApproachLens } from '@/application/ports/ai-coach.port';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { GlassCard } from '@/presentation/components/glass-card';

const APPROACH_OPTIONS: ApproachLens[] = ['spiritual', 'scientific', 'universal'];

const APPROACH_I18N: Record<
  ApproachLens,
  { title: string; hint: string; preview: string }
> = {
  spiritual: {
    title: 'onboarding.approach.spiritual',
    hint: 'onboarding.approach.spiritualHint',
    preview: 'onboarding.approach.spiritualHint',
  },
  scientific: {
    title: 'onboarding.approach.scientific',
    hint: 'onboarding.approach.scientificHint',
    preview: 'onboarding.approach.scientificHint',
  },
  universal: {
    title: 'onboarding.approach.universal',
    hint: 'onboarding.approach.universalHint',
    preview: 'onboarding.approach.universalHint',
  },
};

type ApproachSelectorProps = {
  value: ApproachLens;
  onChange: (approach: ApproachLens) => void;
};

export function ApproachSelector({ value, onChange }: ApproachSelectorProps) {
  const { t } = useTranslation();

  return (
    <View className="gap-3">
      {APPROACH_OPTIONS.map((approach) => {
        const copy = APPROACH_I18N[approach];
        const selected = value === approach;

        return (
          <Pressable key={approach} onPress={() => onChange(approach)}>
            <GlassCard
              accessibilityRole="button"
              accessibilityState={{ selected }}
              className={`p-4 ${selected ? 'border-accent' : ''}`}
            >
            <Text className="text-base font-semibold text-foreground dark:text-foreground-dark">
              {t(copy.title)}
            </Text>
            <Text className="mt-1 text-sm text-muted dark:text-muted-dark">{t(copy.hint)}</Text>
            <Text className="mt-3 text-xs uppercase tracking-wide text-muted dark:text-muted-dark">
              {t('onboarding.approach.previewLabel')}
            </Text>
            <Text className="mt-1 text-sm italic text-foreground dark:text-foreground-dark">
              {t(copy.preview)}
            </Text>
          </GlassCard>
          </Pressable>
        );
      })}
    </View>
  );
}
