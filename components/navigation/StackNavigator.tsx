import React, { memo } from 'react';
import { Stack } from 'expo-router';
import { Platform } from 'react-native';
import { Colors } from '@/constants/DesignSystem';

interface StackNavigatorProps {
  screens: {
    name: string;
    options?: {
      headerShown?: boolean;
      title?: string;
      [key: string]: any;
    };
  }[];
  defaultOptions?: {
    headerShown?: boolean;
    [key: string]: any;
  };
}

// Optimized default screen options for performance
const defaultScreenOptions = {
  headerShown: false,
  // Enable native stack optimizations
  animation: 'slide_from_right' as const,
  // Optimize for performance
  freezeOnBlur: true,
  lazy: true,
  // Consistent styling
  headerStyle: {
    backgroundColor: Colors.background,
  },
  headerTintColor: Colors.text,
  headerTitleStyle: {
    fontWeight: '600' as const,
  },
  // Platform-specific optimizations
  ...(Platform.OS === 'ios' && {
    headerLargeTitle: false,
    headerTransparent: false,
  }),
  ...(Platform.OS === 'android' && {
    statusBarStyle: 'auto' as const,
    statusBarBackgroundColor: Colors.background,
  }),
};

/**
 * Optimized Stack Navigator component with performance enhancements
 * @param screens Array of screen configurations with name and options
 * @param defaultOptions Default options to apply to all screens
 */
function StackNavigator({ 
  screens, 
  defaultOptions = defaultScreenOptions 
}: StackNavigatorProps) {
  const mergedOptions = { ...defaultScreenOptions, ...defaultOptions };

  return (
    <Stack screenOptions={mergedOptions}>
      {screens.map((screen) => (
        <Stack.Screen 
          key={screen.name} 
          name={screen.name} 
          options={{
            ...mergedOptions,
            ...screen.options,
          }} 
        />
      ))}
    </Stack>
  );
}

export default memo(StackNavigator);