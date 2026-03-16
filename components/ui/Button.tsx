import React from 'react';
import { Pressable, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { ThemedText } from '../ThemedText';
import { Colors, Typography, BorderRadius, Spacing, ComponentStyles } from '@/constants/DesignSystem';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
  accessibilityLabel,
  accessibilityHint,
}: ButtonProps) {
  const getButtonStyle = () => {
    const baseStyle = {
      ...ComponentStyles.button,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      flexDirection: 'row' as const,
    };

    // Size variations
    const sizeStyles = {
      sm: { height: 36, paddingHorizontal: Spacing.md },
      md: { height: 48, paddingHorizontal: Spacing.lg },
      lg: { height: 56, paddingHorizontal: Spacing.xl },
    };

    // Variant styles
    const variantStyles = {
      primary: {
        backgroundColor: disabled ? Colors.gray300 : Colors.primary,
      },
      secondary: {
        backgroundColor: disabled ? Colors.gray300 : Colors.secondary,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: disabled ? Colors.gray300 : Colors.primary,
      },
      ghost: {
        backgroundColor: 'transparent',
      },
      danger: {
        backgroundColor: disabled ? Colors.gray300 : Colors.error,
      },
    };

    return [
      baseStyle,
      sizeStyles[size],
      variantStyles[variant],
      fullWidth && { width: '100%' },
      disabled && { opacity: 0.6 },
      style,
    ];
  };

  const getTextStyle = () => {
    const baseTextStyle = {
      fontSize: size === 'sm' ? Typography.sm : size === 'lg' ? Typography.lg : Typography.base,
      fontWeight: Typography.semibold,
    };

    const variantTextStyles = {
      primary: { color: Colors.white },
      secondary: { color: Colors.white },
      outline: { color: disabled ? Colors.gray400 : Colors.primary },
      ghost: { color: disabled ? Colors.gray400 : Colors.primary },
      danger: { color: Colors.white },
    };

    return [
      baseTextStyle,
      variantTextStyles[variant],
      textStyle,
    ];
  };

  return (
    <Pressable
      style={({ pressed }) => [
        ...getButtonStyle(),
        pressed && !disabled && { opacity: 0.8 },
      ] as any}
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
    >
      <ThemedText style={getTextStyle()}>
        {loading ? 'Loading...' : title}
      </ThemedText>
    </Pressable>
  );
}
