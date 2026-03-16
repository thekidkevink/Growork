import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle, useColorScheme } from 'react-native';
import { Colors as ThemeColors } from '@/constants/Colors';
import { BorderRadius, Spacing } from '@/constants/DesignSystem';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
  animated?: boolean;
}

export default function SkeletonLoader({
  width = '100%',
  height = 20,
  borderRadius = BorderRadius.sm,
  style,
  animated = true,
}: SkeletonLoaderProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const colorScheme = useColorScheme() ?? 'light';
  const colors = ThemeColors[colorScheme];

  useEffect(() => {
    if (!animated) return;

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [animatedValue, animated]);

  const backgroundColor = animated
    ? animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [colors.backgroundSecondary, colors.border],
      })
    : colors.backgroundSecondary;

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor,
        },
        style,
      ]}
    />
  );
}

// Pre-built skeleton components for common use cases
export function PostSkeleton() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = ThemeColors[colorScheme];
  const styles = createStyles(colors);

  return (
    <View style={styles.postSkeleton}>
      <View style={styles.postHeader}>
        <SkeletonLoader width={40} height={40} borderRadius={20} />
        <View style={styles.postHeaderText}>
          <SkeletonLoader width="60%" height={16} />
          <SkeletonLoader width="40%" height={12} style={{ marginTop: 4 }} />
        </View>
      </View>
      <SkeletonLoader width="100%" height={16} style={{ marginTop: Spacing.md }} />
      <SkeletonLoader width="80%" height={16} style={{ marginTop: 4 }} />
      <SkeletonLoader width="90%" height={16} style={{ marginTop: 4 }} />
      <SkeletonLoader width="100%" height={200} style={{ marginTop: Spacing.md }} />
      <View style={styles.postActions}>
        <SkeletonLoader width={60} height={32} />
        <SkeletonLoader width={60} height={32} />
        <SkeletonLoader width={60} height={32} />
      </View>
    </View>
  );
}

export function ApplicationSkeleton() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = ThemeColors[colorScheme];
  const styles = createStyles(colors);

  return (
    <View style={styles.applicationSkeleton}>
      <View style={styles.applicationHeader}>
        <SkeletonLoader width={50} height={50} borderRadius={8} />
        <View style={styles.applicationHeaderText}>
          <SkeletonLoader width="70%" height={18} />
          <SkeletonLoader width="50%" height={14} style={{ marginTop: 4 }} />
          <SkeletonLoader width="30%" height={12} style={{ marginTop: 4 }} />
        </View>
      </View>
      <SkeletonLoader width="100%" height={14} style={{ marginTop: Spacing.sm }} />
      <SkeletonLoader width="60%" height={14} style={{ marginTop: 4 }} />
      <View style={styles.applicationFooter}>
        <SkeletonLoader width={80} height={24} />
        <SkeletonLoader width={100} height={32} />
      </View>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  skeleton: {
    backgroundColor: colors.backgroundSecondary,
  },
  postSkeleton: {
    paddingVertical: Spacing.lg,
    backgroundColor: colors.background,
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postHeaderText: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  applicationSkeleton: {
    paddingVertical: Spacing.lg,
    backgroundColor: colors.background,
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  applicationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  applicationHeaderText: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  applicationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
});
