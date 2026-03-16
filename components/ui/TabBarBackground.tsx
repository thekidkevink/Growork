// This is a shim for web and Android where the tab bar is generally opaque.
import { useThemeColor } from '@/hooks';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { View } from 'react-native';

export default function TabBarBackground() {
  const backgroundColor = useThemeColor({}, 'background');
  return <View style={{ backgroundColor, flex: 1 }} />;
}

export function useBottomTabOverflow() {
  return useBottomTabBarHeight();
}
