import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Pressable } from 'react-native';
import { ThemedText } from '../ThemedText';
import { Feather } from '@expo/vector-icons';
import { Colors, BorderRadius, Spacing, Shadows } from '@/constants/DesignSystem';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  visible: boolean;
  onDismiss: () => void;
  duration?: number;
}

export default function Toast({
  message,
  type = 'info',
  visible,
  onDismiss,
  duration = 4000,
}: ToastProps) {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (visible) {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Slide in
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
      }).start();

      // Auto dismiss after duration
      timeoutRef.current = setTimeout(() => {
        handleDismiss();
      }, duration) as unknown as NodeJS.Timeout;
    } else {
      // Slide out
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [visible, duration, slideAnim]);

  const handleDismiss = () => {
    Animated.timing(slideAnim, {
      toValue: -100,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onDismiss();
    });
  };

  const getToastStyle = () => {
    const typeStyles = {
      success: { backgroundColor: Colors.success },
      error: { backgroundColor: Colors.error },
      warning: { backgroundColor: Colors.warning },
      info: { backgroundColor: Colors.info },
    };

    return [styles.toast, typeStyles[type]];
  };

  const getIcon = (): keyof typeof import('@expo/vector-icons').Feather.glyphMap => {
    const icons = {
      success: 'check-circle' as const,
      error: 'x-circle' as const,
      warning: 'alert-triangle' as const,
      info: 'info' as const,
    };

    return icons[type];
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY: slideAnim }] },
      ]}
    >
      <Pressable
        style={getToastStyle()}
        onPress={handleDismiss}
        accessibilityLabel={`${type} message: ${message}`}
        accessibilityRole="alert"
      >
        <Feather name={getIcon()} size={20} color={Colors.white} />
        <ThemedText style={styles.message} numberOfLines={2}>
          {message}
        </ThemedText>
        <Pressable
          style={styles.closeButton}
          onPress={handleDismiss}
          accessibilityLabel="Dismiss"
          accessibilityRole="button"
        >
          <Feather name="x" size={18} color={Colors.white} />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: Spacing.lg,
    right: Spacing.lg,
    zIndex: 1000,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    ...Shadows.lg,
    gap: Spacing.sm,
  },
  message: {
    flex: 1,
    color: Colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  closeButton: {
    padding: 4,
  },
});
