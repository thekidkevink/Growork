import { Colors } from "@/constants/Colors";
import { useColorScheme, useThemeColor } from "@/hooks";
import * as Haptics from "expo-haptics";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { ThemedText } from "../ThemedText";

interface SegmentedControlProps {
  options: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
  style?: any;
}

const CategorySelector: React.FC<SegmentedControlProps> = ({
  options,
  selectedIndex,
  onChange,
  style,
}) => {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const backgroundSecondary = useThemeColor({}, "backgroundSecondary");
  const textColor = useThemeColor({}, "text");
  const activeTabBg = useThemeColor({}, "icon");
  const activeTabText = useThemeColor({}, "background");

  const handleTabPress = (index: number) => {
    if (process.env.EXPO_OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onChange(index);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: backgroundSecondary,
          shadowColor: theme.shadow,
        },
        style,
      ]}
    >
      {options.map((option, index) => {
        const selected = index === selectedIndex;

        return (
          <Pressable
            key={`${option}-${index}`}
            onPress={() => handleTabPress(index)}
            style={({ pressed }) => [
              styles.tab,
              selected && [styles.activeTab, { backgroundColor: activeTabBg }],
              pressed && !selected && styles.pressedTab,
            ]}
          >
            <ThemedText
              style={[
                styles.tabText,
                { color: selected ? activeTabText : textColor },
              ]}
              numberOfLines={1}
            >
              {option}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderRadius: 12,
    marginHorizontal: 16,
    minHeight: 44,
    padding: 3,
    alignItems: "stretch",
  },
  tab: {
    flex: 1,
    minHeight: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  activeTab: {
    elevation: 2,
  },
  pressedTab: {
    opacity: 0.7,
  },
  tabText: {
    fontSize: 15,
    textAlign: "center",
    fontWeight: "500",
  },
});

export default CategorySelector;
