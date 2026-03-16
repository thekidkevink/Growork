import React, { useEffect } from 'react';
import { Pressable, Animated } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

interface NewPostsIndicatorProps {
  visible: boolean;
  onPress: () => void;
  message?: string;
  style?: any;
}

export default function NewPostsIndicator({
  visible,
  onPress,
  message = "New posts • Tap to refresh",
  style
}: NewPostsIndicatorProps) {
  // Auto-hide after 4 seconds
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onPress(); // This will hide the indicator
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [visible, onPress]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[{
        position: 'absolute',
        top: 20,
        left: 20,
        right: 20,
        zIndex: 100,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 2,
        elevation: 3,
      }, style]}
    >
      <Pressable onPress={onPress}>
        <ThemedText style={{ color: '#fff', textAlign: 'center', fontWeight: '500', fontSize: 13 }}>
          {message}
        </ThemedText>
      </Pressable>
    </Animated.View>
  );
}
