import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

interface PostButtonProps {
  onPress: () => void;
  disabled: boolean;
  loading: boolean;
  style?: ViewStyle;
}

export default function PostButton({ 
  onPress, 
  disabled, 
  loading,
  style 
}: PostButtonProps) {
  return (
    <Pressable
      style={[
        styles.postButton, 
        disabled && styles.disabledButton,
        style
      ]}
      disabled={disabled || loading}
      onPress={onPress}
    >
      {loading ? 
        <ActivityIndicator size="small" color="#fff" /> :
        <ThemedText style={styles.postButtonText}>Post</ThemedText>
      }
    </Pressable>
  );
}

const styles = StyleSheet.create({
  postButton: {
    flex: 1,
    backgroundColor: '#525252',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
  postButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 0.2,
  },
});
