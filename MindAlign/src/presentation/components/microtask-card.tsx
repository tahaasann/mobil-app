import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

type MicroTaskCardProps = {
  barrierLabel: string;
  microTask: string;
  encouragement: string;
  onComplete: () => void;
  onGiveUp: () => void;
};

export function MicroTaskCard({
  barrierLabel,
  microTask,
  encouragement,
  onComplete,
  onGiveUp,
}: MicroTaskCardProps) {
  const { t } = useTranslation();

  return (
    <View className="mt-4 rounded-2xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-600 dark:bg-amber-950/40">
      <Text className="mb-1 text-xs font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-200">
        {t('microTask.barrier', { label: barrierLabel })}
      </Text>
      <Text className="mb-2 text-base font-semibold text-foreground dark:text-foreground-dark">
        {microTask}
      </Text>
      <Text className="mb-4 text-sm text-muted dark:text-muted-dark">{encouragement}</Text>

      <View className="flex-row gap-3">
        <Pressable
          accessibilityRole="button"
          className="flex-1 rounded-lg bg-amber-500 px-3 py-2"
          onPress={onComplete}
        >
          <Text className="text-center text-sm font-semibold text-white">
            {t('microTask.rescue')}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          className="flex-1 rounded-lg bg-gray-300 px-3 py-2 dark:bg-gray-700"
          onPress={onGiveUp}
        >
          <Text className="text-center text-sm font-semibold text-gray-800 dark:text-gray-100">
            {t('microTask.giveUp')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
