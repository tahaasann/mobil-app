import { useEffect } from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { getBreathingPhaseAt } from '@/domain/breathing/breathing-cycle';

type BreathingOrbProps = {
  elapsedMs: number;
};

export function BreathingOrb({ elapsedMs }: BreathingOrbProps) {
  const pulse = useSharedValue(1);
  const state = getBreathingPhaseAt(elapsedMs);
  const progress = state.phaseElapsedMs / state.phaseDurationMs;
  const targetScale =
    state.phase === 'inhale'
      ? 0.6 + progress * 0.4
      : state.phase === 'exhale'
        ? 1 - progress * 0.4
        : 1;

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(targetScale, { duration: 300, easing: Easing.inOut(Easing.ease) }),
      1,
      false,
    );
  }, [targetScale, pulse]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <Animated.View
      testID="breathing-orb"
      style={style}
      className="h-48 w-48 rounded-full bg-accent/30 border-2 border-accent"
    />
  );
}
