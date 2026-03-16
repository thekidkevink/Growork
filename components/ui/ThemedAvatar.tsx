import React from "react";
import { View } from "react-native";
import { Image } from "expo-image";
import { ThemedText } from "../ThemedText";
import { useThemeColor } from "@/hooks";

interface ThemedAvatarProps {
  image: string;
  size?: number;
  square?: boolean;
  children?: React.ReactNode;
}

export const ThemedAvatar: React.FC<ThemedAvatarProps> = ({
  image,
  size = 42,
  square = false,
  children,
}) => {
  const backgroundColor = useThemeColor({}, 'backgroundSecondary');
  const textColor = useThemeColor({}, 'text');

  // Generate fallback initials
  const getFallbackInitials = () => {
    if (!image) return '?';

    try {
      // Try to extract initials from UI Avatars URL
      if (image.includes('ui-avatars.com') && image.includes('name=')) {
        const nameMatch = image.match(/name=([^&]+)/);
        if (nameMatch) {
          const decodedName = decodeURIComponent(nameMatch[1]);
          return decodedName.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
        }
      }
    } catch {
      // If parsing fails, continue to default
    }
    return '?';
  };

  // Check if the image URL is valid
  const isValidImageUrl = () => {
    if (!image || image.trim() === '') return false;
    try {
      new URL(image);
      return true;
    } catch {
      return false;
    }
  };

  if (!image || !isValidImageUrl()) {
    return (
      <View style={{ position: "relative" }}>
        <View
          style={{
            width: size,
            height: size,
            borderRadius: square ? 4 : size / 2,
            backgroundColor,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ThemedText
            style={{
              color: textColor,
              fontSize: size * 0.4,
              fontWeight: '600',
            }}
          >
            {getFallbackInitials()}
          </ThemedText>
        </View>
        {children}
      </View>
    );
  }

  return (
    <View style={{ position: "relative" }}>
      <Image
        source={{ uri: image }}
        style={{
          width: size,
          height: size,
          borderRadius: square ? 4 : size / 2,
        }}
        contentFit="cover"
      />
      {children}
    </View>
  );
};
