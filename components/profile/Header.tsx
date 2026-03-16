import { Colors } from "@/constants/Colors";
import { useThemeColor } from "@/hooks";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";
import { ThemedText } from "../ThemedText";
import { ThemedView } from "../ThemedView";

export type ProfileHeaderProps = {
  name: string;
  avatarUrl: string;
  status: string;
  subtitle: string;
  bio?: string;
  profileStrength: string;
  profileStrengthDescription: string;
  stats: { label: string; value: string | number }[];
  details?: { label: string; value: string; icon: string }[];
  onEdit?: () => void;
  isBusinessUser?: boolean;
  onStatPress?: (statLabel: string) => void;
};

function ProfileHeader({
  name,
  avatarUrl,
  status,
  subtitle,
  bio,
  profileStrength,
  profileStrengthDescription,
  stats,
  details = [],
  onEdit,
  isBusinessUser = false,
  onStatPress,
}: ProfileHeaderProps) {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const borderColor = useThemeColor({}, "border");
  const backgroundColor = useThemeColor({}, "background");
  const iconColor = useThemeColor({}, "icon");
  const textColor = useThemeColor({}, "text");
  const subtitleColor = useThemeColor({}, "mutedText");
  const cardBg = useThemeColor({}, "backgroundSecondary");
  const pressedBg = useThemeColor({}, "backgroundTertiary");
  const accentColor = "#a5b4fc"; // Soft pastel indigo
  const successColor = "#86efac"; // Soft pastel green

  return (
    <ThemedView
      style={[
        styles.container,
        { borderBottomColor: borderColor, backgroundColor },
      ]}
    >
      {/* Top Row: Avatar + Edit Button */}
      <ThemedView style={styles.topRow}>
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        <Pressable
          style={({ pressed }) => [
            styles.iconButton,
            {
              backgroundColor: pressed ? pressedBg : backgroundColor,
              borderColor: borderColor,
              shadowColor: theme.shadow,
            },
          ]}
          hitSlop={8}
          onPress={() => {
            if (process.env.EXPO_OS === "ios") {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            onEdit && onEdit();
          }}
        >
          <Feather name="settings" size={16} color={iconColor} />
        </Pressable>
      </ThemedView>

      {/* Name and Status */}
      <ThemedView style={styles.infoSection}>
        <ThemedView style={styles.nameRow}>
          <ThemedText style={[styles.name, { color: textColor }]}>
            {name}
          </ThemedText>
          <View style={styles.badgeContainer}>
            <ThemedView
              style={[
                styles.badge,
                { backgroundColor: successColor, borderColor: successColor },
              ]}
            >
              <ThemedText style={[styles.badgeText, { color: "#374151" }]}>
                {status}
              </ThemedText>
            </ThemedView>
            {isBusinessUser && (
              <ThemedView
                style={[
                  styles.badge,
                  {
                    backgroundColor: "#fef3c7",
                    borderColor: "#fcd34d",
                    marginLeft: 6,
                  },
                ]}
              >
                <ThemedText style={[styles.badgeText, { color: "#92400e" }]}>
                  Business
                </ThemedText>
              </ThemedView>
            )}
          </View>
        </ThemedView>
        <ThemedText style={[styles.subtitle, { color: subtitleColor }]}>
          {subtitle}
        </ThemedText>
        {bio && (
          <ThemedText style={[styles.bio, { color: textColor }]}>
            {bio}
          </ThemedText>
        )}
      </ThemedView>

      {/* Profile Strength Card */}
      <ThemedView
        style={[styles.profileStrengthCard, { borderColor: borderColor }]}
      >
        <ThemedView
          style={[
            styles.strengthIconWrap,
            { backgroundColor: accentColor, borderColor: accentColor },
          ]}
        >
          <Feather name="shield" size={16} color="#374151" />
        </ThemedView>
        <ThemedView style={styles.strengthTextWrap}>
          <ThemedText style={[styles.strengthTitle, { color: textColor }]}>
            {profileStrength}
          </ThemedText>
          <ThemedText
            style={[styles.strengthSubtitle, { color: subtitleColor }]}
          >
            {profileStrengthDescription}
          </ThemedText>
        </ThemedView>
      </ThemedView>

      {/* User Details */}
      {details.length > 0 && (
        <ThemedView
          style={[styles.detailsSection, { borderTopColor: borderColor }]}
        >
          {details.map((detail, index) => (
            <ThemedView
              key={`${detail.label}-${detail.value}-${index}`}
              style={[
                styles.detailItem,
                index > 0 && { borderTopColor: borderColor },
              ]}
            >
              <ThemedView style={styles.detailHeader}>
                <Feather
                  name={detail.icon as any}
                  size={14}
                  color={iconColor}
                />
                <ThemedText
                  style={[styles.detailLabel, { color: subtitleColor }]}
                >
                  {detail.label}
                </ThemedText>
              </ThemedView>
              <ThemedText style={[styles.detailValue, { color: textColor }]}>
                {detail.value}
              </ThemedText>
            </ThemedView>
          ))}
        </ThemedView>
      )}

      {/* Stats Row */}
      <ThemedView style={[styles.statsRow, { borderTopColor: borderColor }]}>
        {stats.map((stat) => (
          <Pressable
            key={`${stat.label}-${stat.value}`}
            style={({ pressed }) => [
              styles.statItem,
              {
                backgroundColor: pressed ? pressedBg : "transparent",
                borderRadius: 8,
                padding: 8,
              },
            ]}
            onPress={() => {
              if (process.env.EXPO_OS === "ios") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              onStatPress?.(stat.label);
            }}
          >
            <ThemedText style={[styles.statValue, { color: textColor }]}>
              {stat.value}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: subtitleColor }]}>
              {stat.label}
            </ThemedText>
          </Pressable>
        ))}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "column",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 20,
    gap: 20,
  },
  topRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#f0f0f0",
  },
  iconButton: {
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  infoSection: {
    width: "100%",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 8,
  },
  nameRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  badge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#374151",
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  bio: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  profileStrengthCard: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
  },
  strengthIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderWidth: 1,
  },
  strengthTextWrap: {
    flex: 1,
    flexDirection: "column",
    alignItems: "flex-start",
  },
  strengthTitle: {
    fontWeight: "600",
    fontSize: 13,
    marginBottom: 2,
  },
  strengthSubtitle: {
    fontSize: 11,
    lineHeight: 16,
  },
  detailsSection: {
    width: "100%",
    flexDirection: "column",
    alignItems: "flex-start",
    paddingTop: 16,
    borderTopWidth: 1,
  },
  detailItem: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "right",
    flex: 1,
  },
  statsRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    paddingTop: 20,
  },
  statItem: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
  },
  statValue: {
    fontWeight: "600",
    fontSize: 15,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    lineHeight: 14,
  },
});

export default ProfileHeader;
