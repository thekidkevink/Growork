import React from "react";
import {
  ScrollView,
  Pressable,
  StyleSheet,
  ViewStyle,
  View,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks";

export interface BadgeOption {
  label: string;
  value: string;
  icon?: string; // Optional, for Feather icon
}

interface BadgeSelectorProps {
  options: BadgeOption[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  style?: ViewStyle;
  title?: string;
}

export default function BadgeSelector({
  options,
  selectedValue,
  onValueChange,
  style,
  title,
}: BadgeSelectorProps) {
  const badgeBg = useThemeColor({}, "backgroundSecondary");
  const badgeSelectedBg = useThemeColor({}, "icon");
  const badgeText = useThemeColor({}, "text");
  const badgeSelectedText = useThemeColor({}, "background");

  return (
    <View style={style}>
      {title && <ThemedText style={styles.title}>{title}</ThemedText>}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.badgeRow}
        keyboardShouldPersistTaps="handled"
      >
        {options.map((option) => {
          const selected = selectedValue === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onValueChange(option.value)}
              style={({ pressed }) => [
                styles.badge,
                {
                  backgroundColor: selected ? badgeSelectedBg : badgeBg,
                  opacity: pressed ? 0.75 : 1,
                },
              ]}
            >
              {/* Optionally display icon: */}
              {/* {option.icon && (
                <Feather name={option.icon as any} size={18} color={selected ? badgeSelectedText : badgeText} />
              )} */}
              <ThemedText
                style={[
                  styles.badgeText,
                  { color: selected ? badgeSelectedText : badgeText },
                ]}
              >
                {option.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,

    marginVertical: 0,
    marginHorizontal: 0,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 4,
    marginVertical: 4,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: "500",
  },
  title: {
    fontWeight: "bold",
    fontSize: 15,
    marginBottom: 4,
  },
});
