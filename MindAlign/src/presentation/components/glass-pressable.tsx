import { useEffect, useState, type ReactNode } from 'react';
import { AccessibilityInfo, Pressable, type PressableProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type GlassPressableProps = PressableProps & {
  children: ReactNode;
  className?: string;
};

export function GlassPressable({ children, className, disabled, onPressIn, onPressOut, ...rest }: GlassPressableProps) {
  const scale = useSharedValue(1);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      className={className}
      style={animatedStyle}
      onPressIn={(event) => {
        if (!disabled && !reduceMotion) {
          scale.value = withSpring(0.97, { damping: 18, stiffness: 320 });
        }
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        if (!reduceMotion) {
          scale.value = withSpring(1, { damping: 18, stiffness: 320 });
        }
        onPressOut?.(event);
      }}
    >
      {children}
    </AnimatedPressable>
  );
}
