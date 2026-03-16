import { HapticTab } from '@/components/HapticTab';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks';
import { rootTabs } from '@/src/features/app-shell/config/tabs';
import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const tabNameMap: Record<(typeof rootTabs)[number]['id'], string> = {
    home: 'index',
    jobs: 'applications',
    search: 'search',
    bookmarks: 'bookmarks',
    profile: 'profile',
  };

  return (
    <Tabs
      detachInactiveScreens={false}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.tabIconSelected,
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: theme.border,
        },
      }}>
      {rootTabs.map((tab) => (
        <Tabs.Screen
          key={tab.id}
          name={tabNameMap[tab.id]}
          options={{
            title: tab.label,
            tabBarAccessibilityLabel: tab.accessibilityLabel,
            tabBarIcon: ({ color }) => (
              <Feather name={tab.icon as React.ComponentProps<typeof Feather>['name']} size={20} color={color} />
            ),
            tabBarButton: (props) => <HapticTab {...props} />,
            headerShown: false,
          }}
        />
      ))}
    </Tabs>
  );
}
