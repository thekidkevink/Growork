import React from "react";
import { View, StyleSheet } from "react-native";
import { ThemedText } from "../ThemedText";
import { useThemeColor } from "@/hooks";
import CustomOptionStrip from "./CustomOptionStrip";

const BOOKMARK_CATEGORIES = [
  { icon: "briefcase", label: "Jobs" },
  { icon: "book-open", label: "News" },
  { icon: "coffee", label: "Applications" },
];

interface BookmarksHeaderProps {
  selectedCategory: number;
  onCategoryChange: (index: number) => void;
  subtitle: string;
}

export default function BookmarksHeader({
  selectedCategory,
  onCategoryChange,
  subtitle,
}: BookmarksHeaderProps) {
  const textColor = useThemeColor({}, "text");
  const mutedTextColor = useThemeColor({}, "mutedText");

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <ThemedText style={[styles.title, { color: textColor }]}>
          Bookmarks
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: mutedTextColor }]}>
          {subtitle}
        </ThemedText>
      </View>

      <View style={styles.stripContainer}>
        <CustomOptionStrip
          visibleOptions={BOOKMARK_CATEGORIES}
          selectedIndex={selectedCategory}
          onChange={onCategoryChange}
          style={styles.categoryStrip}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  titleContainer: {
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  stripContainer: {
    marginTop: 8,
  },
  categoryStrip: {},
});
