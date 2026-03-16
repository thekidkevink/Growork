import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { useThemeColor } from '@/hooks';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  text?: string;
  fullScreen?: boolean;
}

export default function LoadingSpinner({ 
  size = 'large', 
  text = 'Loading...', 
  fullScreen = false 
}: LoadingSpinnerProps) {
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');

  const containerStyle = fullScreen ? styles.fullScreenContainer : styles.container;

  return (
    <ThemedView style={containerStyle}>
      <ActivityIndicator 
        size={size} 
        color={tintColor}
        accessibilityLabel="Loading"
      />
      {text && (
        <ThemedText style={[styles.text, { color: textColor }]}>
          {text}
        </ThemedText>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreenContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  text: {
    marginTop: 12,
    fontSize: 16,
    textAlign: 'center',
  },
});
