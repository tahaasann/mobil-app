import { useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

import {
  resolveCelebrationMessageKey,
  type CelebrationMessageKey,
} from '@/presentation/habits/celebration-message';
import { triggerDoneHaptic } from '@/presentation/habits/trigger-done-haptic';

type HabitDoneCelebrationProps = {
  visible: boolean;
  streak: number;
};

const CONFETTI_COLORS = ['#10B981', '#F59E0B', '#38BDF8', '#A78BFA', '#F472B6'];

const CONFETTI_LAYOUT = [
  { left: '10%', top: '18%' },
  { left: '22%', top: '12%' },
  { left: '34%', top: '20%' },
  { left: '46%', top: '10%' },
  { left: '58%', top: '16%' },
  { left: '70%', top: '12%' },
  { left: '82%', top: '20%' },
  { left: '90%', top: '14%' },
] as const;

function ConfettiParticle({
  index,
  active,
  color,
  left,
  top,
}: {
  index: number;
  active: boolean;
  color: string;
  left: string;
  top: string;
}) {
  const drift = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (!active) {
      drift.value = 0;
      opacity.value = 0;
      return;
    }

    drift.value = withRepeat(withTiming(index % 2 === 0 ? -14 : 14, { duration: 520 }), 3, true);
    opacity.value = withSequence(withTiming(1, { duration: 120 }), withTiming(0, { duration: 900 }));
  }, [active, drift, index, opacity]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: drift.value }, { rotate: `${index * 24}deg` }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[style, { position: 'absolute', left, top, width: 8, height: 8, borderRadius: 4, backgroundColor: color }]}
      testID={`habit-celebration-confetti-${index}`}
    />
  );
}

function celebrationCopy(
  t: (key: string, options?: Record<string, unknown>) => string,
  key: CelebrationMessageKey,
  streak: number,
): string {
  switch (key) {
    case 'first':
      return t('habit.celebration.first');
    case 'building':
      return t('habit.celebration.building', { count: streak });
    case 'milestone':
      return t('habit.celebration.milestone', { count: streak });
    case 'legend':
      return t('habit.celebration.legend', { count: streak });
  }
}

export function HabitDoneCelebration({ visible, streak }: HabitDoneCelebrationProps) {
  const { t } = useTranslation();
  const [reduceMotion, setReduceMotion] = useState(false);
  const scale = useSharedValue(0.85);
  const glow = useSharedValue(0.4);
  const messageKey = resolveCelebrationMessageKey(streak);
  const message = useMemo(() => celebrationCopy(t, messageKey, streak), [messageKey, streak, t]);

  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
  }, []);

  useEffect(() => {
    if (!visible) {
      scale.value = 0.85;
      glow.value = 0.4;
      return;
    }

    void triggerDoneHaptic();

    if (reduceMotion) {
      scale.value = 1;
      glow.value = 0.8;
      return;
    }

    scale.value = withSpring(1, { damping: 12, stiffness: 180 });
    glow.value = withRepeat(
      withSequence(withTiming(1, { duration: 420 }), withTiming(0.45, { duration: 420 })),
      2,
      true,
    );
  }, [glow, reduceMotion, scale, visible]);

  const burstStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: glow.value,
  }));

  const messageStyle = useAnimatedStyle(() => ({
    transform: [{ scale: reduceMotion ? 1 : scale.value }],
  }));

  if (!visible) {
    return null;
  }

  return (
    <View
      accessibilityLiveRegion="polite"
      className="absolute inset-0 z-10 items-center justify-center rounded-2xl bg-emerald-500/15 px-4"
      pointerEvents="none"
      testID="habit-done-celebration"
    >
      {!reduceMotion
        ? CONFETTI_LAYOUT.map((layout, index) => (
            <ConfettiParticle
              key={index}
              active={visible}
              color={CONFETTI_COLORS[index % CONFETTI_COLORS.length] ?? '#10B981'}
              index={index}
              left={layout.left}
              top={layout.top}
            />
          ))
        : null}

      <Animated.View
        style={burstStyle}
        className="absolute h-28 w-28 rounded-full bg-emerald-400/35"
        testID="habit-celebration-glow"
      />

      <Animated.View style={messageStyle}>
        <Text
          accessibilityRole="text"
          className="text-center text-base font-bold text-emerald-800 dark:text-emerald-300"
          testID="habit-celebration-message"
        >
          {message}
        </Text>
      </Animated.View>
    </View>
  );
}
