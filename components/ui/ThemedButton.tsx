import React from "react";
import { Pressable, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { ThemedText } from "../ThemedText";
import { useThemeColor } from "@/hooks";

export interface ThemedButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  children?: React.ReactNode;
}

export default function ThemedButton({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  disabled = false,
  style,
  textStyle,
  children,
}: ThemedButtonProps) {
  const textColor = useThemeColor({}, "text");
  const backgroundColor = useThemeColor({}, "background");
  const borderColor = useThemeColor({}, "border");
  const mutedTextColor = useThemeColor({}, "mutedText");

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 4,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
      opacity: disabled ? 0.6 : 1,
    };

    const sizeStyles = {
      small: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        minWidth: 60,
      },
      medium: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        minWidth: 80,
      },
      large: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        minWidth: 100,
      },
    };

    const variantStyles = {
      primary: {
        backgroundColor: textColor,
        borderColor: textColor,
      },
      secondary: {
        backgroundColor: backgroundColor,
        borderColor: textColor,
      },
      outline: {
        backgroundColor: "transparent",
        borderColor: textColor,
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...style,
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseTextStyle: TextStyle = {
      fontWeight: "500",
    };

    const sizeTextStyles = {
      small: {
        fontSize: 12,
      },
      medium: {
        fontSize: 14,
      },
      large: {
        fontSize: 16,
      },
    };

    const variantTextStyles = {
      primary: {
        color: backgroundColor,
      },
      secondary: {
        color: textColor,
      },
      outline: {
        color: textColor,
      },
    };

    return {
      ...baseTextStyle,
      ...sizeTextStyles[size],
      ...variantTextStyles[variant],
      ...textStyle,
    };
  };

  return (
    <Pressable style={getButtonStyle()} onPress={onPress} disabled={disabled}>
      {children || <ThemedText style={getTextStyle()}>{title}</ThemedText>}
    </Pressable>
  );
}
