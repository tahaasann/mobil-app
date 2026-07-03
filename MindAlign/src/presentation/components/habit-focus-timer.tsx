import { useCallback, useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { GlassCard } from '@/presentation/components/glass-card';
import { GlassPressable } from '@/presentation/components/glass-pressable';
import {
  DEFAULT_FOCUS_SECONDS,
  formatFocusTime,
  nextFocusSecondsRemaining,
} from '@/presentation/habits/focus-timer';

type HabitFocusTimerProps = {
  durationSeconds?: number;
};

export function HabitFocusTimer({ durationSeconds = DEFAULT_FOCUS_SECONDS }: HabitFocusTimerProps) {
  const { t } = useTranslation();
  const [remainingSeconds, setRemainingSeconds] = useState(durationSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const timer = setInterval(() => {
      setRemainingSeconds((current) => {
        const next = nextFocusSecondsRemaining(current, true);
        if (next === 0) {
          setIsRunning(false);
          setIsComplete(true);
          return 0;
        }
        return next ?? current;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning]);

  const handleStart = useCallback(() => {
    setIsComplete(false);
    setRemainingSeconds(durationSeconds);
    setIsRunning(true);
  }, [durationSeconds]);

  const handleStop = useCallback(() => {
    setIsRunning(false);
    setRemainingSeconds(durationSeconds);
    setIsComplete(false);
  }, [durationSeconds]);

  return (
    <GlassCard variant="subtle" className="p-4" testID="habit-focus-timer">
      <Text className="text-base font-semibold text-foreground dark:text-foreground-dark">
        {t('habitDetail.focusTitle')}
      </Text>
      <Text className="mt-1 text-sm text-muted dark:text-muted-dark">
        {t('habitDetail.focusHint')}
      </Text>

      <Text
        accessibilityLiveRegion="polite"
        className="mt-4 text-center text-3xl font-semibold text-accent"
        testID="habit-focus-time"
      >
        {formatFocusTime(remainingSeconds)}
      </Text>

      {isComplete ? (
        <Text className="mt-2 text-center text-sm font-medium text-emerald-600 dark:text-emerald-400">
          {t('habitDetail.focusComplete')}
        </Text>
      ) : null}

      <View className="mt-4 flex-row gap-2">
        <GlassPressable
          accessibilityRole="button"
          accessibilityLabel={t('habitDetail.focusStart')}
          className="flex-1 rounded-xl bg-accent px-4 py-3"
          disabled={isRunning}
          testID="habit-focus-start"
          onPress={handleStart}
        >
          <Text className="text-center text-sm font-semibold text-white">
            {t('habitDetail.focusStart')}
          </Text>
        </GlassPressable>

        <GlassPressable
          accessibilityRole="button"
          accessibilityLabel={t('habitDetail.focusStop')}
          className="flex-1 rounded-xl bg-gray-500/80 px-4 py-3"
          disabled={!isRunning}
          testID="habit-focus-stop"
          onPress={handleStop}
        >
          <Text className="text-center text-sm font-semibold text-white">
            {t('habitDetail.focusStop')}
          </Text>
        </GlassPressable>
      </View>
    </GlassCard>
  );
}
