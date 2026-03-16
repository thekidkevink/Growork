import React, { useState, useEffect } from "react";
import {
  Alert,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  useColorScheme,
  Image,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

import { useAuth, useThemeColor } from "@/hooks";
import { Profile } from "@/types";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import ScreenContainer from "@/components/ScreenContainer";
import { checkProfileCompleteness } from "@/hooks/auth";
import { supabase } from "@/utils/supabase";
import { useFlashToast } from "@/components/ui/Flash";

interface ProfileStats {
  posts: number;
  followers: number;
  following: number;
  applications: number;
  bookmarks: number;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const colorScheme = useColorScheme();
  const textColor = useThemeColor({}, "text");
  const backgroundColor = useThemeColor({}, "background");
  const borderColor = useThemeColor({}, "border");
  const mutedTextColor = useThemeColor({}, "mutedText");
  const tintColor = useThemeColor({}, "tint");
  const [stats, setStats] = useState<ProfileStats>({
    posts: 0,
    followers: 0,
    following: 0,
    applications: 0,
    bookmarks: 0,
  });
  const [loading, setLoading] = useState(true);
  const toast = useFlashToast();

  const displayName = [profile?.name, profile?.surname]
    .filter(Boolean)
    .join(" ")
    .trim();
  const avatarName = displayName || profile?.username || "User";

  useEffect(() => {
    if (user) {
      fetchProfileStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (!profile) return;
    const completeness = checkProfileCompleteness(profile);
    if (!completeness.isComplete) {
      const required = completeness.missingRequired
        .map((k: keyof Profile) => String(k))
        .join(", ");
      toast.show({
        type: "info",
        title: "Complete your profile",
        message: required
          ? `Missing required: ${required}`
          : "Add more details to improve your profile.",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const fetchProfileStats = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch posts count
      const { count: postsCount } = await supabase
        .from("posts")
        .select("*", { count: "exact", head: true })
        .or(`user_id.eq.${user.id},applicant_id.eq.${user.id}`);

      // Fetch applications count
      const { count: applicationsCount } = await supabase
        .from("applications")
        .select("*", { count: "exact", head: true })
        .or(`user_id.eq.${user.id},applicant_id.eq.${user.id}`);

      // Fetch bookmarks count
      const { count: bookmarksCount } = await supabase
        .from("bookmarks")
        .select("*", { count: "exact", head: true })
        .or(`user_id.eq.${user.id},applicant_id.eq.${user.id}`);

      // Fetch following count (companies followed)
      const { count: followingCount } = await supabase
        .from("company_follows")
        .select("*", { count: "exact", head: true })
        .eq("profile_id", user.id);

      setStats({
        posts: postsCount || 0,
        followers: 0, // Placeholder - would need followers table
        following: followingCount || 0,
        applications: applicationsCount || 0,
        bookmarks: bookmarksCount || 0,
      });
    } catch (_error: any) {
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    router.push("/profile/edit-profile");
  };

  const handleSettings = () => {
    router.push("/settings");
  };

  const handleViewPosts = () => {
    if (profile?.user_type === "business") {
      router.push("/(tabs)/profile");
      return;
    }

    Alert.alert(
      "Posts live in the feed",
      "Your published activity appears in the main feed. Switch to a business-style profile if you want a dedicated My Posts workspace."
    );
  };

  const handleViewApplications = () => {
    router.push("/(tabs)/applications");
  };

  const handleViewBookmarks = () => {
    router.push("/(tabs)/bookmarks");
  };

  const handleOpenWebsite = async () => {
    if (!profile?.website) return;

    const website = /^https?:\/\//i.test(profile.website)
      ? profile.website
      : `https://${profile.website}`;

    try {
      await Linking.openURL(website);
    } catch {
      Alert.alert("Unavailable", "We could not open this website right now.");
    }
  };

  const handleOpenPhone = async () => {
    if (!profile?.phone) return;

    try {
      await Linking.openURL(`tel:${profile.phone}`);
    } catch {
      Alert.alert("Unavailable", "We could not open your phone app right now.");
    }
  };

  if (!profile) {
    return (
      <ScreenContainer>
        <StatusBar
          barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
        />
        <View style={styles.loadingContainer}>
          <ThemedText style={[styles.loadingText, { color: mutedTextColor }]}>
            Loading profile...
          </ThemedText>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
      />

      {/* Header */}
      <ThemedView style={[styles.header, { borderBottomColor: borderColor }]}>
        <View style={styles.headerLeft}>
          <ThemedText style={styles.headerTitle}>Profile</ThemedText>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleSettings}
          >
            <Feather name="settings" size={20} color={textColor} />
          </TouchableOpacity>
        </View>
      </ThemedView>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <ThemedView style={styles.profileHeader}>
          <View style={styles.avatarSection}>
            <Image
              source={{
                uri:
                  profile.avatar_url ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    avatarName
                  )}&size=120`,
              }}
              style={styles.avatar}
            />
            <TouchableOpacity
              style={[styles.editAvatarButton, { backgroundColor: tintColor }]}
              onPress={handleEditProfile}
            >
              <Feather name="camera" size={16} color={backgroundColor} />
            </TouchableOpacity>
          </View>

          <View style={styles.profileInfo}>
            <ThemedText style={styles.profileName}>
              {displayName || "User"}
            </ThemedText>
            {profile.username && (
              <ThemedText
                style={[styles.profileUsername, { color: mutedTextColor }]}
              >
                @{profile.username}
              </ThemedText>
            )}
            <View style={styles.userTypeContainer}>
              <ThemedText
                style={[styles.userTypeText, { color: mutedTextColor }]}
              >
                {profile.user_type === "business"
                  ? "Business Account"
                  : "Personal Account"}
              </ThemedText>
              {profile.user_type === "business" && <UserTypeBadge />}
            </View>
            {profile.profession && (
              <ThemedText
                style={[styles.profileProfession, { color: mutedTextColor }]}
              >
                {profile.profession}
              </ThemedText>
            )}
            {profile.location && (
              <ThemedText
                style={[styles.profileLocation, { color: mutedTextColor }]}
              >
                <Feather name="map-pin" size={12} color={mutedTextColor} />{" "}
                {profile.location}
              </ThemedText>
            )}
            {profile.experience_years && (
              <ThemedText
                style={[styles.profileExperience, { color: mutedTextColor }]}
              >
                <Feather name="clock" size={12} color={mutedTextColor} />{" "}
                {profile.experience_years} years experience
              </ThemedText>
            )}
          </View>

          <TouchableOpacity
            style={[styles.editProfileButton, { borderColor }]}
            onPress={handleEditProfile}
          >
            <Feather name="edit-3" size={16} color={textColor} />
            <ThemedText style={[styles.editProfileText, { color: textColor }]}>
              Edit Profile
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {/* Bio Section */}
        {profile.bio && (
          <ThemedView style={styles.bioSection}>
            <ThemedText style={styles.bioText}>{profile.bio}</ThemedText>
          </ThemedView>
        )}

        {/* Stats Section */}
        <ThemedView style={styles.statsSection}>
          <View style={styles.statsRow}>
            <TouchableOpacity style={styles.statItem} onPress={handleViewPosts}>
              <ThemedText style={styles.statNumber}>{stats.posts}</ThemedText>
              <ThemedText style={[styles.statLabel, { color: mutedTextColor }]}>
                Posts
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statItem}>
              <ThemedText style={styles.statNumber}>
                {stats.followers}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: mutedTextColor }]}>
                Followers
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.statItem}
              onPress={() => router.push("/profile/companies")}
            >
              <ThemedText style={styles.statNumber}>
                {stats.following}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: mutedTextColor }]}>
                Companies
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>

        {/* Quick Actions */}
        <ThemedView style={styles.quickActionsSection}>
          <ThemedText style={styles.sectionTitle}>Quick Actions</ThemedText>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={[styles.quickActionCard, { borderColor }]}
              onPress={handleViewApplications}
            >
              <View
                style={[
                  styles.quickActionIcon,
                  { backgroundColor: tintColor + "20" },
                ]}
              >
                <Feather name="briefcase" size={20} color={tintColor} />
              </View>
              <ThemedText style={styles.quickActionTitle}>
                Applications
              </ThemedText>
              <ThemedText
                style={[styles.quickActionSubtitle, { color: mutedTextColor }]}
              >
                {stats.applications} applications
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionCard, { borderColor }]}
              onPress={handleViewBookmarks}
            >
              <View
                style={[
                  styles.quickActionIcon,
                  { backgroundColor: tintColor + "20" },
                ]}
              >
                <Feather name="bookmark" size={20} color={tintColor} />
              </View>
              <ThemedText style={styles.quickActionTitle}>Bookmarks</ThemedText>
              <ThemedText
                style={[styles.quickActionSubtitle, { color: mutedTextColor }]}
              >
                {stats.bookmarks} saved
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionCard, { borderColor }]}
              onPress={() => router.push("/profile/documents")}
            >
              <View
                style={[
                  styles.quickActionIcon,
                  { backgroundColor: tintColor + "20" },
                ]}
              >
                <Feather name="folder" size={20} color={tintColor} />
              </View>
              <ThemedText style={styles.quickActionTitle}>Documents</ThemedText>
              <ThemedText
                style={[styles.quickActionSubtitle, { color: mutedTextColor }]}
              >
                Manage CV & files
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionCard, { borderColor }]}
              onPress={() => router.push("/profile/companies")}
            >
              <View
                style={[
                  styles.quickActionIcon,
                  { backgroundColor: tintColor + "20" },
                ]}
              >
                <Feather name="briefcase" size={20} color={tintColor} />
              </View>
              <ThemedText style={styles.quickActionTitle}>Companies</ThemedText>
              <ThemedText
                style={[styles.quickActionSubtitle, { color: mutedTextColor }]}
              >
                Manage companies
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>

        {/* Skills Section */}
        {profile.skills && profile.skills.length > 0 && (
          <ThemedView style={styles.skillsSection}>
            <ThemedText style={styles.sectionTitle}>Skills</ThemedText>
            <View style={styles.skillsContainer}>
              {profile.skills.map((skill, index) => (
                <View
                  key={index}
                  style={[
                    styles.skillChip,
                    { backgroundColor: tintColor + "20" },
                  ]}
                >
                  <ThemedText style={[styles.skillText, { color: tintColor }]}>
                    {skill}
                  </ThemedText>
                </View>
              ))}
            </View>
          </ThemedView>
        )}

        {/* Contact Info */}
        {(profile.website || profile.phone) && (
          <ThemedView style={styles.contactSection}>
            <ThemedText style={styles.sectionTitle}>Contact</ThemedText>
            {profile.website && (
              <TouchableOpacity style={styles.contactItem} onPress={handleOpenWebsite}>
                <Feather name="globe" size={16} color={mutedTextColor} />
                <ThemedText style={[styles.contactText, { color: tintColor }]}>
                  {profile.website}
                </ThemedText>
              </TouchableOpacity>
            )}
            {profile.phone && (
              <TouchableOpacity style={styles.contactItem} onPress={handleOpenPhone}>
                <Feather name="phone" size={16} color={mutedTextColor} />
                <ThemedText style={[styles.contactText, { color: tintColor }]}>
                  {profile.phone}
                </ThemedText>
              </TouchableOpacity>
            )}
          </ThemedView>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

// UserTypeBadge component
function UserTypeBadge() {
  const { user } = useAuth();
  const [companyStatus, setCompanyStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const tintColor = useThemeColor({}, "tint");
  const backgroundColor = useThemeColor({}, "background");

  useEffect(() => {
    if (user) {
      fetchCompanyStatus();
    }
  }, [user]);

  const fetchCompanyStatus = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("companies")
        .select("status")
        .or(`user_id.eq.${user.id},owner_id.eq.${user.id}`)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        setCompanyStatus(data.status);
      }
    } catch (_err) {
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.badge, { backgroundColor: tintColor + "20" }]}>
        <ThemedText style={[styles.badgeText, { color: tintColor }]}>
          Loading...
        </ThemedText>
      </View>
    );
  }

  if (!companyStatus) {
    return (
      <View style={[styles.badge, { backgroundColor: "#f3f4f6" }]}>
        <ThemedText style={[styles.badgeText, { color: "#6b7280" }]}>
          No Company
        </ThemedText>
      </View>
    );
  }

  const getBadgeStyle = () => {
    switch (companyStatus) {
      case "verified":
      case "approved":
        return { backgroundColor: "#10b981", color: "#ffffff" };
      case "pending":
        return { backgroundColor: "#f59e0b", color: "#ffffff" };
      case "rejected":
        return { backgroundColor: "#ef4444", color: "#ffffff" };
      default:
        return { backgroundColor: "#6b7280", color: "#ffffff" };
    }
  };

  const getBadgeText = () => {
    switch (companyStatus) {
      case "verified":
        return "Verified";
      case "approved":
        return "Approved";
      case "pending":
        return "Pending";
      case "rejected":
        return "Rejected";
      default:
        return "Unknown";
    }
  };

  const badgeStyle = getBadgeStyle();

  return (
    <View
      style={[styles.badge, { backgroundColor: badgeStyle.backgroundColor }]}
    >
      <ThemedText style={[styles.badgeText, { color: badgeStyle.color }]}>
        {getBadgeText()}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    padding: 8,
  },
  profileHeader: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    alignItems: "center",
  },
  avatarSection: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfo: {
    alignItems: "center",
    marginBottom: 20,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 4,
  },
  profileUsername: {
    fontSize: 16,
    marginBottom: 8,
    fontStyle: "italic",
  },
  userTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  userTypeText: {
    fontSize: 14,
  },
  profileProfession: {
    fontSize: 16,
    marginBottom: 8,
  },
  profileLocation: {
    fontSize: 14,
    marginBottom: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  profileExperience: {
    fontSize: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  editProfileButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  editProfileText: {
    fontSize: 14,
    fontWeight: "500",
  },
  bioSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
  },
  bioText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
  },
  statsSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  quickActionsSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  quickActionCard: {
    width: "48%",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  quickActionSubtitle: {
    fontSize: 12,
    textAlign: "center",
  },
  skillsSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  skillChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  skillText: {
    fontSize: 12,
    fontWeight: "500",
  },
  contactSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    gap: 8,
  },
  contactText: {
    fontSize: 14,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
