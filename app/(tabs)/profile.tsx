import ScreenContainer from "@/components/ScreenContainer";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useAuth, useCompanies, usePermissions, useThemeColor } from "@/hooks";
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
  const { companies } = useCompanies();
  const { isBusinessUser } = usePermissions();
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
  const primaryCompany = companies[0];

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
      id: "edit-profile",
      label: "Edit Profile",
      subtitle: "Update your details and account settings",
      iconName: "user",
      onPress: () => router.push("/profile/edit-profile"),
    },
    {
      id: "documents",
      label: "Documents",
      subtitle: "Manage your CV and supporting files",
      iconName: "folder",
      onPress: () => router.push("/profile/documents"),
    },
    {
      id: "business-account",
      label: isBusinessUser
        ? primaryCompany
          ? "Manage Account"
          : "Finish Business Setup"
        : "Set Up Business Account",
      subtitle: isBusinessUser
        ? primaryCompany
          ? `Edit ${primaryCompany.name} and manage your business profile`
          : "Create your company profile to finish business setup"
        : "Unlock publishing, companies, and incoming applications",
      iconName: "briefcase",
      onPress: () =>
        isBusinessUser && primaryCompany?.id
          ? router.push(`/profile/CompanyManagement?id=${primaryCompany.id}`)
          : router.push("/profile/CompanyManagement?upgradeToBusiness=true"),
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
    {
      id: "applications",
      label: "Applications",
      subtitle: "Track your recent job applications",
      iconName: "inbox",
      onPress: () => router.push("/(tabs)/applications"),
    },
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
    [isBusinessUser, primaryCompany?.id, primaryCompany?.name, router]
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
          <ThemedText style={[styles.subtitle, { color: mutedTextColor }]}>
            {loading
              ? "Loading your account..."
              : displayName || profile?.username
              ? `Signed in as ${displayName || `@${profile?.username}`}`
              : "Manage your account, documents, and activity."}
          </ThemedText>
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
          {isBusinessUser ? (
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
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
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
