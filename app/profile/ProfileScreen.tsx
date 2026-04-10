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
import { useFocusEffect, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

import { useAuth, useBusinessRequests, usePermissions, useThemeColor } from "@/hooks";
import { Profile } from "@/types";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import ScreenContainer from "@/components/ScreenContainer";
import UniversalHeader from "@/components/ui/UniversalHeader";
import { checkProfileCompleteness } from "@/hooks/auth";
import { useFlashToast } from "@/components/ui/Flash";
import { supabase } from "@/utils/supabase";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { isAdmin } = usePermissions();
  const { myLatestRequest, fetchMyLatestRequest } = useBusinessRequests();
  const colorScheme = useColorScheme();
  const textColor = useThemeColor({}, "text");
  const backgroundColor = useThemeColor({}, "background");
  const borderColor = useThemeColor({}, "border");
  const mutedTextColor = useThemeColor({}, "mutedText");
  const tintColor = useThemeColor({}, "tint");
  const toast = useFlashToast();

  const displayName = [profile?.name, profile?.surname]
    .filter(Boolean)
    .join(" ")
    .trim();
  const avatarName = displayName || profile?.username || "User";

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

  useFocusEffect(
    React.useCallback(() => {
      void fetchMyLatestRequest();
    }, [fetchMyLatestRequest])
  );

  const handleEditProfile = () => {
    router.push("/profile/edit-profile");
  };

  const handleSwitchToBusiness = () => {
    router.push("/profile/business-request");
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

  const formattedDateOfBirth = profile?.date_of_birth
    ? new Date(`${profile.date_of_birth}T00:00:00`).toLocaleDateString()
    : null;
  const businessRequestStatusLabel = myLatestRequest?.status
    ? myLatestRequest.status.charAt(0).toUpperCase() +
      myLatestRequest.status.slice(1)
    : null;

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

      <UniversalHeader
        title="Profile"
        titleOffsetY={4}
        showBackButton
        showNotifications={false}
      />

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
                {isAdmin
                  ? "Admin Account"
                  : profile.user_type === "business"
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
            {formattedDateOfBirth && (
              <ThemedText
                style={[styles.profileProfession, { color: mutedTextColor }]}
              >
                Born {formattedDateOfBirth}
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

        {profile.user_type !== "business" ? (
          <ThemedView style={styles.businessSection}>
            <ThemedText style={styles.sectionTitle}>Business Account</ThemedText>
            {myLatestRequest?.status === "pending" ? (
              <TouchableOpacity
                style={[
                  styles.requestStatusCard,
                  { borderColor, backgroundColor: backgroundColor },
                ]}
                onPress={handleSwitchToBusiness}
                activeOpacity={0.85}
              >
                <View style={styles.requestStatusHeader}>
                  <Feather name="clock" size={16} color={tintColor} />
                  <ThemedText style={styles.requestStatusTitle}>
                    Request Under Review
                  </ThemedText>
                </View>
                <ThemedText
                  style={[styles.businessDescription, { color: mutedTextColor }]}
                >
                  Your business account request has been submitted and is waiting
                  for admin review.
                </ThemedText>
                <ThemedText
                  style={[styles.requestStatusMeta, { color: mutedTextColor }]}
                >
                  Status: {businessRequestStatusLabel}
                </ThemedText>
                <ThemedText
                  style={[styles.requestStatusMeta, { color: mutedTextColor }]}
                >
                  Submitted on{" "}
                  {new Date(myLatestRequest.created_at).toLocaleDateString()}
                </ThemedText>
                <View style={styles.requestStatusFooter}>
                  <ThemedText
                    style={[styles.requestStatusLink, { color: tintColor }]}
                  >
                    View request details
                  </ThemedText>
                  <Feather name="chevron-right" size={16} color={tintColor} />
                </View>
              </TouchableOpacity>
            ) : (
              <>
                <ThemedText
                  style={[styles.businessDescription, { color: mutedTextColor }]}
                >
                  {myLatestRequest?.status === "rejected"
                    ? "Your last request was not approved. You can review the feedback and submit an updated request."
                    : "Request business access to unlock company tools, publishing, and applicant management."}
                </ThemedText>
                {myLatestRequest?.status === "rejected" ? (
                  <TouchableOpacity
                    style={[
                      styles.requestStatusCard,
                      { borderColor, backgroundColor: backgroundColor },
                    ]}
                    onPress={handleSwitchToBusiness}
                    activeOpacity={0.85}
                  >
                    <View style={styles.requestStatusHeader}>
                      <Feather name="x-circle" size={16} color="#ef4444" />
                      <ThemedText style={styles.requestStatusTitle}>
                        Request Not Approved
                      </ThemedText>
                    </View>
                    <ThemedText
                      style={[styles.requestStatusMeta, { color: mutedTextColor }]}
                    >
                      Status: {businessRequestStatusLabel}
                    </ThemedText>
                    {myLatestRequest.admin_notes ? (
                      <ThemedText
                        style={[styles.requestStatusMeta, { color: mutedTextColor }]}
                      >
                        Reason: {myLatestRequest.admin_notes}
                      </ThemedText>
                    ) : null}
                    <View style={styles.requestStatusFooter}>
                      <ThemedText
                        style={[styles.requestStatusLink, { color: tintColor }]}
                      >
                        View submitted details
                      </ThemedText>
                      <Feather name="chevron-right" size={16} color={tintColor} />
                    </View>
                  </TouchableOpacity>
                ) : null}
                <TouchableOpacity
                  style={[styles.businessButton, { borderColor }]}
                  onPress={handleSwitchToBusiness}
                >
                  <Feather name="briefcase" size={16} color={textColor} />
                  <ThemedText
                    style={[styles.editProfileText, { color: textColor }]}
                  >
                    {myLatestRequest?.status === "rejected"
                      ? "Update Business Request"
                      : "Request Business Account"}
                  </ThemedText>
                </TouchableOpacity>
              </>
            )}
          </ThemedView>
        ) : null}

        {isAdmin ? (
          <ThemedView style={styles.businessSection}>
            <ThemedText style={styles.sectionTitle}>Admin</ThemedText>
            <ThemedText
              style={[styles.businessDescription, { color: mutedTextColor }]}
            >
              Review business account requests and manage launch content from the admin workspace.
            </ThemedText>
            <TouchableOpacity
              style={[styles.businessButton, { borderColor }]}
              onPress={() => router.push("/admin")}
            >
              <Feather name="shield" size={16} color={textColor} />
              <ThemedText
                style={[styles.editProfileText, { color: textColor }]}
              >
                Open Admin Workspace
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        ) : null}
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
    marginBottom: 10,
  },
  businessButton: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
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
  businessSection: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  businessDescription: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 14,
  },
  requestStatusCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    gap: 6,
  },
  requestStatusHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  requestStatusTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  requestStatusMeta: {
    fontSize: 14,
    lineHeight: 20,
  },
  requestStatusFooter: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  requestStatusLink: {
    fontSize: 14,
    fontWeight: "600",
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
