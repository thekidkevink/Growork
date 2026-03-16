import React from "react";
import { ScrollView, Pressable, StyleSheet } from "react-native";
import { ThemedText } from "../../ThemedText";
import { useThemeColor } from "@/hooks";

// ✅ Add explicit types for props and map param!
interface EmojiBarProps {
  emojis: string[];
  onEmoji: (emoji: string) => void;
}

export function EmojiBar({ emojis, onEmoji }: EmojiBarProps) {
  const borderColor = useThemeColor({}, "border");
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 2 }}>
      {emojis.map((emoji: string) => (
        <Pressable
          style={[styles.badge, { borderColor }]}
          onPress={() => onEmoji(emoji)}
          key={emoji}
        >
          <ThemedText style={styles.badgeText}>{emoji}</ThemedText>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  badge: {
    height: 30,
    minWidth: 36,
    paddingHorizontal: 11,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  badgeText: { fontSize: 16 },
});
