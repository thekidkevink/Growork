import ScreenContainer from "@/components/ScreenContainer";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useAuth, usePermissions, useThemeColor } from "@/hooks";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

export default function ProfileTab() {
  const router = useRouter();
  const { user, profile, loading, refreshProfile } = useAuth();
  const { isAdmin, isBusinessUser } = usePermissions();
  const textColor = useThemeColor({}, "text");
  const mutedTextColor = useThemeColor({}, "mutedText");
  const borderColor = useThemeColor({}, "border");
  const iconColor = useThemeColor({}, "icon");
  const backgroundSecondary = useThemeColor({}, "backgroundSecondary");
  const backgroundTertiary = useThemeColor({}, "backgroundTertiary");
  const [refreshing, setRefreshing] = React.useState(false);

  const displayName = [profile?.name, profile?.surname]
    .filter(Boolean)
    .join(" ")
    .trim();
  const accountLabel = displayName || profile?.username || "Your account";
  const handleRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshProfile();
    } finally {
      setRefreshing(false);
    }
  }, [refreshProfile]);

  const actions = React.useMemo(
    () => [
      {
      id: "view-profile",
      label: "View Profile",
      subtitle: "See your profile, stats, and quick actions",
      iconName: "user",
      onPress: () => router.push("/profile/ProfileScreen"),
    },
    {
      id: "documents",
      label: "Documents",
      subtitle: "Manage your CV and supporting files",
      iconName: "folder",
      onPress: () => router.push("/profile/documents"),
    },
    {
      id: "companies",
      label: "Companies",
      subtitle: "View or manage the companies linked to you",
      iconName: "briefcase",
      onPress: () => router.push("/profile/companies"),
    },
    ...(isBusinessUser
      ? [
          {
            id: "manage-listings",
            label: "Manage Listings",
            subtitle: "Review your posts and open applicants from one place",
            iconName: "file-text",
            onPress: () => router.push("/profile/listings"),
          },
        ]
      : []),
    ...(isAdmin
      ? [
          {
            id: "admin",
            label: "Admin",
            subtitle: "Review business access requests and seed company content",
            iconName: "shield",
            onPress: () => router.push("/admin"),
          },
        ]
      : []),
    {
      id: "bookmarks",
      label: "Bookmarks",
      subtitle: "Open your saved jobs and posts",
      iconName: "bookmark",
      onPress: () => router.push("/(tabs)/bookmarks"),
    },
    {
      id: "settings",
      label: "Settings",
      subtitle: "Notifications, security, and app settings",
      iconName: "settings",
      onPress: () => router.push("/settings"),
    },
  ],
    [isAdmin, isBusinessUser, router]
  );

  return (
    <ScreenContainer>
      {loading ? (
        <View style={styles.guestState}>
          <Feather name="user" size={28} color={iconColor} />
        </View>
      ) : !user ? (
        <View style={styles.guestState}>
          <Feather name="user" size={28} color={iconColor} />
          <ThemedText style={styles.guestTitle}>Sign in to open your profile</ThemedText>
          <ThemedText style={[styles.guestText, { color: mutedTextColor }]}>
            Your profile, saved files, and account settings will appear here once you sign in.
          </ThemedText>
          <Pressable
            style={[styles.signInButton, { borderColor }]}
            onPress={() => router.push("/auth/login")}
          >
            <ThemedText style={[styles.signInButtonText, { color: textColor }]}>
              Go to Login
            </ThemedText>
          </Pressable>
        </View>
      ) : (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={iconColor}
            colors={[iconColor]}
          />
        }
      >
        <ThemedView style={styles.header}>
          <ThemedText style={styles.title}>Profile</ThemedText>
        </ThemedView>

        <ThemedView
          style={[
            styles.summaryCard,
            { borderColor, backgroundColor: backgroundSecondary },
          ]}
        >
          <View style={styles.summaryRow}>
            <Feather name="user" size={20} color={iconColor} />
            <ThemedText style={styles.summaryTitle}>
              {accountLabel}
            </ThemedText>
          </View>
          <ThemedText style={[styles.summaryText, { color: mutedTextColor }]}>
            {profile?.profession ||
              profile?.bio ||
              "Complete your profile, keep your documents up to date, and manage your activity from here."}
          </ThemedText>
          {isAdmin ? (
            <View style={[styles.badge, { backgroundColor: backgroundTertiary }]}>
              <ThemedText style={[styles.badgeText, { color: textColor }]}>
                Admin tools unlocked
              </ThemedText>
            </View>
          ) : isBusinessUser ? (
            <View style={[styles.badge, { backgroundColor: backgroundTertiary }]}>
              <ThemedText style={[styles.badgeText, { color: textColor }]}>
                Business tools unlocked
              </ThemedText>
            </View>
          ) : null}
        </ThemedView>

        <View style={styles.actions}>
          {actions.map((action) => (
            <Pressable
              key={action.id}
              style={({ pressed }) => [
                styles.actionCard,
                {
                  borderColor,
                  backgroundColor: pressed ? backgroundSecondary : "transparent",
                },
              ]}
              onPress={action.onPress}
            >
              <View style={[styles.iconWrap, { backgroundColor: backgroundTertiary }]}>
                <Feather
                  name={action.iconName as React.ComponentProps<typeof Feather>["name"]}
                  size={18}
                  color={iconColor}
                />
              </View>
              <View style={styles.actionTextWrap}>
                <ThemedText style={[styles.actionTitle, { color: textColor }]}>
                  {action.label}
                </ThemedText>
                <ThemedText
                  style={[styles.actionSubtitle, { color: mutedTextColor }]}
                >
                  {action.subtitle}
                </ThemedText>
              </View>
              <Feather name="chevron-right" size={18} color={mutedTextColor} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    gap: 16,
    paddingBottom: 36,
  },
  header: {
    gap: 6,
    paddingTop: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  summaryCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
    gap: 10,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 20,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#00000008",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  actions: {
    gap: 12,
  },
  actionCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  actionTextWrap: {
    flex: 1,
    gap: 4,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  actionSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  guestState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    gap: 12,
  },
  guestTitle: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },
  guestText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  signInButton: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  signInButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
