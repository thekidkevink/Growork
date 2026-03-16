import React, { memo, useMemo } from 'react';
import { View, Pressable, StyleSheet, Platform } from 'react-native';
import { ThemedText } from '../ThemedText';
import { Feather } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadows } from '@/constants/DesignSystem';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface TabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

const TabBarButton = memo(({ 
  route, 
  isFocused, 
  onPress, 
  onLongPress, 
  label, 
  icon 
}: {
  route: any;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  label: string;
  icon: string;
}) => {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={`${label} tab`}
      testID={`tab-${route.name}`}
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        styles.tabButton,
        pressed && styles.tabButtonPressed,
        isFocused && styles.tabButtonFocused,
      ]}
    >
      <Feather
        name={icon as any}
        size={20}
        color={isFocused ? Colors.primary : Colors.textSecondary}
      />
      <ThemedText
        style={[
          styles.tabLabel,
          { color: isFocused ? Colors.primary : Colors.textSecondary },
        ]}
      >
        {label}
      </ThemedText>
    </Pressable>
  );
});

TabBarButton.displayName = 'TabBarButton';

function OptimizedTabBar({ state, descriptors, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();

  const tabConfig = useMemo(() => ({
    index: { label: 'Discover', icon: 'compass' },
    applications: { label: 'My Jobs', icon: 'briefcase' },
    search: { label: 'Search', icon: 'search' },
    bookmarks: { label: 'Saved', icon: 'bookmark' },
    profile: { label: 'Profile', icon: 'user' },
  }), []);

  const containerStyle = useMemo(() => [
    styles.container,
    {
      paddingBottom: Math.max(insets.bottom, 16),
      ...(Platform.OS === 'ios' ? Shadows.sm : { elevation: 8 }),
    },
  ], [insets.bottom]);

  return (
    <View style={containerStyle}>
      <View style={styles.tabBar}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const config = tabConfig[route.name as keyof typeof tabConfig];

          if (!config) return null;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TabBarButton
              key={route.key}
              route={route}
              isFocused={isFocused}
              onPress={onPress}
              onLongPress={onLongPress}
              label={config.label}
              icon={config.icon}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  tabBar: {
    flexDirection: 'row',
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    borderRadius: BorderRadius.md,
    minHeight: 48,
  },
  tabButtonPressed: {
    backgroundColor: Colors.backgroundSecondary,
  },
  tabButtonFocused: {
    backgroundColor: `${Colors.primary}10`,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
  },
});

export default memo(OptimizedTabBar);
