import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '../ThemedText';
import { Feather } from '@expo/vector-icons';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import AnimatedTransition from './AnimatedTransition';
import { Colors, Spacing, BorderRadius } from '@/constants/DesignSystem';

export default function OfflineIndicator() {
  const { isConnected } = useNetworkStatus();

  return (
    <AnimatedTransition visible={!isConnected} type="slide">
      <View style={styles.container}>
        <Feather name="wifi-off" size={16} color={Colors.white} />
        <ThemedText style={styles.text}>
          You're offline. Some features may be limited.
        </ThemedText>
      </View>
    </AnimatedTransition>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.warning,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderRadius: BorderRadius.sm,
    margin: Spacing.sm,
  },
  text: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
});
