// Navigation.tsx
import React from 'react';
import { TouchableOpacity, ViewStyle, StyleSheet, Text, View } from 'react-native';

interface NavigationProps {
  onPress?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  style?: ViewStyle;
  testID?: string;
}

export function Navigation({ onPress, disabled, children, style, testID }: NavigationProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        disabled && styles.disabled,
        style
      ]}
      testID={testID}
      activeOpacity={0.85}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
        {children}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8'
  },
  disabled: {
    opacity: 0.5
  }
});
