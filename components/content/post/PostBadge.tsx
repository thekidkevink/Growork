import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks';

interface PostBadgeProps {
  label: string;
  icon?: keyof typeof Feather.glyphMap;
  variant?: 'default' | 'highlighted' | 'success' | 'warning' | 'error';
  size?: 'small' | 'medium';
  style?: any;
}

export default function PostBadge({
  label,
  icon,
  variant = 'default',
  size = 'medium',
  style
}: PostBadgeProps) {
  // Get theme colors
  const baseTextColor = useThemeColor({}, 'mutedText');
  
  // Define variant colors
  const variantColors = {
    default: { bg: useThemeColor({}, 'backgroundSecondary'), text: baseTextColor },
    highlighted: { bg: useThemeColor({}, 'backgroundSecondary'), text: useThemeColor({}, 'tint') },
    success: { bg: '#e6f9ee', text: '#0d9f4f' },
    warning: { bg: '#fff8e6', text: '#f59e0b' },
    error: { bg: '#fee2e2', text: '#ef4444' },
  };
  
  // Set sizes
  const iconSizes = { small: 12, medium: 14 };
  const textSizes = { small: 11, medium: 12 };
  const paddings = { 
    small: { paddingVertical: 4, paddingHorizontal: 8 }, 
    medium: { paddingVertical: 6, paddingHorizontal: 10 }
  };
  
  const { bg, text } = variantColors[variant];
  const iconSize = iconSizes[size];
  const fontSize = textSizes[size];
  const padding = paddings[size];
  
  return (
    <View style={[
      styles.badge,
      { 
        backgroundColor: bg,
        ...padding
      },
      style
    ]}>
      {icon && (
        <Feather 
          name={icon} 
          size={iconSize} 
          color={text} 
          style={styles.icon}
        />
      )}
      <ThemedText 
        style={[
          styles.text,
          { 
            color: text,
            fontSize: fontSize,
          }
        ]}
      >
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    gap: 6,
  },
  icon: {
    marginRight: -2, // Tighten spacing between icon and text
  },
  text: {
    fontWeight: '500',
  },
});