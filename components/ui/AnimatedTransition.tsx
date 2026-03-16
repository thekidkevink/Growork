import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';
import { Animation } from '@/constants/DesignSystem';

interface AnimatedTransitionProps {
  children: React.ReactNode;
  visible: boolean;
  type?: 'fade' | 'slide' | 'scale';
  duration?: number;
  style?: ViewStyle;
}

export default function AnimatedTransition({
  children,
  visible,
  type = 'fade',
  duration = Animation.duration.normal,
  style,
}: AnimatedTransitionProps) {
  const animatedValue = useRef(new Animated.Value(visible ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: visible ? 1 : 0,
      duration,
      useNativeDriver: true,
    }).start();
  }, [visible, duration, animatedValue]);

  const getAnimatedStyle = () => {
    switch (type) {
      case 'fade':
        return {
          opacity: animatedValue,
        };
      case 'slide':
        return {
          opacity: animatedValue,
          transform: [
            {
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        };
      case 'scale':
        return {
          opacity: animatedValue,
          transform: [
            {
              scale: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }),
            },
          ],
        };
      default:
        return { opacity: animatedValue };
    }
  };

  return (
    <Animated.View style={[getAnimatedStyle(), style]}>
      {children}
    </Animated.View>
  );
}
