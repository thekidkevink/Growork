import React from "react";
import { Pressable } from "react-native";

interface ThemedIconButtonProps {
  icon: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
}

export const ThemedIconButton: React.FC<ThemedIconButtonProps> = ({
  icon,
  onPress,
  disabled = false,
}) => (
  <Pressable
    style={({ pressed }) => [
      {
        opacity: pressed ? 0.5 : disabled ? 0.3 : 1,
        padding: 6,
      },
    ]}
    hitSlop={10}
    onPress={onPress}
    disabled={disabled}
  >
    {icon}
  </Pressable>
);
