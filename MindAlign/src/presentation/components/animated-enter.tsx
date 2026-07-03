import { useEffect, useState, type ReactNode } from 'react';
import { AccessibilityInfo } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

type AnimatedEnterProps = {
  children: ReactNode;
  index?: number;
  className?: string;
};

export function AnimatedEnter({ children, index = 0, className }: AnimatedEnterProps) {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
  }, []);

  if (reduceMotion) {
    return <Animated.View className={className}>{children}</Animated.View>;
  }

  return (
    <Animated.View entering={FadeInDown.delay(index * 40).duration(320)} className={className}>
      {children}
    </Animated.View>
  );
}
