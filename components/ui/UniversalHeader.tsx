import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks";
import NotificationBadge from "@/components/ui/NotificationBadge";
// import { Spacing, BorderRadius } from "@/constants/DesignSystem";

interface UniversalHeaderProps {
  title: string;
  subtitle?: string;
  centerTitle?: boolean;
  titleOffsetY?: number;
  showBackButton?: boolean;
  showNotifications?: boolean;
  showAddButton?: boolean;
  onAddPress?: () => void;
  rightAction?: {
    icon?: string;
    text?: string;
    onPress: () => void;
  };
}

export default function UniversalHeader({
  title,
  subtitle,
  centerTitle = false,
  titleOffsetY = 0,
  showBackButton = false,
  showNotifications = true,
  showAddButton = false,
  onAddPress,
  rightAction,
}: UniversalHeaderProps) {
  const router = useRouter();
  const textColor = useThemeColor({}, "text");
  const mutedTextColor = useThemeColor({}, "mutedText");
  const borderColor = useThemeColor({}, "border");
  const iconColor = useThemeColor({}, "icon");

  return (
    <View
      style={[
        styles.header,
        {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: borderColor,
        },
      ]}
    >
      <View style={styles.topRow}>
        <View style={[styles.leftSection, centerTitle && styles.leftSectionCentered]}>
          {showBackButton && (
            <Pressable
              style={styles.iconButton}
              onPress={() => router.back()}
              hitSlop={8}
            >
              <Feather name="arrow-left" size={22} color={iconColor} />
            </Pressable>
          )}
          <View style={[styles.titleSection, centerTitle && styles.titleSectionCentered]}>
            <ThemedText
              style={[
                styles.title,
                centerTitle && styles.titleCentered,
                { color: textColor, marginTop: titleOffsetY },
              ]}
              numberOfLines={1}
            >
              {title}
            </ThemedText>
            {subtitle && (
              <ThemedText
                style={[styles.subtitle, centerTitle && styles.subtitleCentered, { color: mutedTextColor }]}
                numberOfLines={1}
              >
                {subtitle}
              </ThemedText>
            )}
          </View>
        </View>

        <View style={styles.rightSection}>
          {showAddButton && onAddPress && (
            <Pressable
              style={styles.iconButton}
              onPress={onAddPress}
              hitSlop={8}
            >
              <Feather name="plus" size={22} color={iconColor} />
            </Pressable>
          )}
          {rightAction && (
            <Pressable
              style={[styles.iconButton, rightAction.text && styles.textButton]}
              onPress={rightAction.onPress}
              hitSlop={8}
            >
              {rightAction.text ? (
                <ThemedText
                  style={[styles.rightActionText, { color: iconColor }]}
                >
                  {rightAction.text}
                </ThemedText>
              ) : (
                <Feather
                  name={rightAction.icon as any}
                  size={22}
                  color={iconColor}
                />
              )}
            </Pressable>
          )}
          {showNotifications && (
            <Pressable
              style={styles.iconButton}
              onPress={() => router.push("/notifications")}
              hitSlop={8}
            >
              <View style={styles.bellContainer}>
                <Feather name="bell" size={22} color={iconColor} />
                <NotificationBadge />
              </View>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 8,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  leftSectionCentered: {
    minWidth: 0,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {},
  textButton: {},
  titleSection: {
    flex: 1,
    marginLeft: 8,
  },
  titleSectionCentered: {
    marginLeft: 0,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    lineHeight: 24,
    letterSpacing: 0.5,
    includeFontPadding: false,
  },
  titleCentered: {
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 18,
    marginTop: 2,
    includeFontPadding: false,
  },
  subtitleCentered: {
    textAlign: "center",
  },
  bellContainer: {
    position: "relative",
  },
  rightActionText: {
    fontSize: 16,
    color: "#525252",
  },
});

