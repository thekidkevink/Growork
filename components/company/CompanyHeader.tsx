import React from "react";
import { Alert, Linking, StyleSheet, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedAvatar } from "@/components/ui/ThemedAvatar";
import ThemedButton from "@/components/ui/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/ui/useThemeColor";
import { Company } from "@/types/company";

interface CompanyHeaderProps {
  company: Company;
  isFollowing: boolean;
  onFollowToggle: () => void;
  loading?: boolean;
  followersCount?: number;
  postsCount?: number;
  jobsCount?: number;
}

type DetailItem = {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
};

export const CompanyHeader: React.FC<CompanyHeaderProps> = ({
  company,
  isFollowing,
  onFollowToggle,
  loading = false,
  followersCount = 0,
  postsCount = 0,
  jobsCount = 0,
}) => {
  const textColor = useThemeColor({}, "text");
  const mutedTextColor = useThemeColor({}, "mutedText");
  const borderColor = useThemeColor({}, "border");
  const tintColor = useThemeColor({}, "tint");
  const backgroundSecondary = useThemeColor({}, "backgroundSecondary");
  const backgroundTertiary = useThemeColor({}, "backgroundTertiary");

  const handleWebsitePress = () => {
    if (!company.website) return;

    const website = /^https?:\/\//i.test(company.website)
      ? company.website
      : `https://${company.website}`;

    Linking.openURL(website).catch(() => {
      Alert.alert("Unavailable", "We could not open this company website.");
    });
  };

  const handleEmailPress = () => {
    if (!company.contact_email) return;

    Linking.openURL(`mailto:${company.contact_email}`).catch(() => {
      Alert.alert("Unavailable", "We could not open your email app right now.");
    });
  };

  const detailItems: DetailItem[] = [
    company.industry ? { icon: "briefcase", label: company.industry } : null,
    company.location ? { icon: "map-pin", label: company.location } : null,
    company.size ? { icon: "users", label: `${company.size} employees` } : null,
    company.founded_year ? { icon: "calendar", label: `Founded ${company.founded_year}` } : null,
  ].filter(Boolean) as DetailItem[];

  return (
    <View style={styles.container}>
      <ThemedView
        style={[
          styles.heroCard,
          { borderColor, backgroundColor: backgroundSecondary },
        ]}
      >
        <View style={styles.heroTop}>
          <ThemedAvatar
            size={88}
            square={true}
            image={
              company.logo_url ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                company.name || "Company"
              )}&size=88&background=random`
            }
          />

          <View style={styles.heroInfo}>
            <ThemedText style={[styles.companyName, { color: textColor }]}>
              {company.name}
            </ThemedText>
            {company.industry ? (
              <ThemedText style={[styles.companySubtitle, { color: mutedTextColor }]}>
                {company.industry}
              </ThemedText>
            ) : null}
          </View>
        </View>

        {company.description ? (
          <ThemedText style={[styles.description, { color: mutedTextColor }]}>
            {company.description}
          </ThemedText>
        ) : null}

        {detailItems.length ? (
          <View style={styles.detailGrid}>
            {detailItems.map((item) => (
              <View
                key={`${item.icon}-${item.label}`}
                style={[
                  styles.detailCard,
                  { borderColor, backgroundColor: backgroundTertiary },
                ]}
              >
                <Feather name={item.icon} size={14} color={tintColor} />
                <ThemedText
                  style={[styles.detailCardText, { color: mutedTextColor }]}
                  numberOfLines={2}
                >
                  {item.label}
                </ThemedText>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.metricsRow}>
          <View
            style={[
              styles.metricCard,
              { borderColor, backgroundColor: backgroundTertiary },
            ]}
          >
            <ThemedText style={[styles.metricValue, { color: textColor }]}>
              {postsCount}
            </ThemedText>
            <ThemedText style={[styles.metricLabel, { color: mutedTextColor }]}>
              Posts
            </ThemedText>
          </View>
          <View
            style={[
              styles.metricCard,
              { borderColor, backgroundColor: backgroundTertiary },
            ]}
          >
            <ThemedText style={[styles.metricValue, { color: textColor }]}>
              {followersCount}
            </ThemedText>
            <ThemedText style={[styles.metricLabel, { color: mutedTextColor }]}>
              Followers
            </ThemedText>
          </View>
          <View
            style={[
              styles.metricCard,
              { borderColor, backgroundColor: backgroundTertiary },
            ]}
          >
            <ThemedText style={[styles.metricValue, { color: textColor }]}>
              {jobsCount}
            </ThemedText>
            <ThemedText style={[styles.metricLabel, { color: mutedTextColor }]}>
              Openings
            </ThemedText>
          </View>
        </View>

        <View style={styles.primaryActions}>
          <ThemedButton
            title={isFollowing ? "Following" : "Follow Company"}
            onPress={onFollowToggle}
            variant={isFollowing ? "primary" : "outline"}
            size="medium"
            style={styles.followButton}
            disabled={loading}
          />
          {company.website ? (
            <TouchableOpacity
              style={[styles.actionButton, { borderColor }]}
              onPress={handleWebsitePress}
            >
              <Feather name="globe" size={16} color={tintColor} />
              <ThemedText style={[styles.actionButtonText, { color: tintColor }]}>
                Website
              </ThemedText>
            </TouchableOpacity>
          ) : null}
        </View>
      </ThemedView>

      {(company.website || company.contact_email) && (
        <ThemedView
          style={[
            styles.contactCard,
            { borderColor, backgroundColor: backgroundSecondary },
          ]}
        >
          <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
            Contact
          </ThemedText>
          {company.website ? (
            <TouchableOpacity
              style={[styles.contactRow, { borderColor }]}
              onPress={handleWebsitePress}
            >
              <View style={styles.contactRowLeft}>
                <Feather name="globe" size={16} color={tintColor} />
                <View style={styles.contactTextWrap}>
                  <ThemedText style={[styles.contactLabel, { color: textColor }]}>
                    Website
                  </ThemedText>
                  <ThemedText
                    style={[styles.contactValue, { color: mutedTextColor }]}
                    numberOfLines={1}
                  >
                    {company.website}
                  </ThemedText>
                </View>
              </View>
              <Feather name="external-link" size={14} color={mutedTextColor} />
            </TouchableOpacity>
          ) : null}
          {company.contact_email ? (
            <TouchableOpacity
              style={[styles.contactRow, { borderColor }]}
              onPress={handleEmailPress}
            >
              <View style={styles.contactRowLeft}>
                <Feather name="mail" size={16} color={tintColor} />
                <View style={styles.contactTextWrap}>
                  <ThemedText style={[styles.contactLabel, { color: textColor }]}>
                    Email
                  </ThemedText>
                  <ThemedText
                    style={[styles.contactValue, { color: mutedTextColor }]}
                    numberOfLines={1}
                  >
                    {company.contact_email}
                  </ThemedText>
                </View>
              </View>
              <Feather name="external-link" size={14} color={mutedTextColor} />
            </TouchableOpacity>
          ) : null}
        </ThemedView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 14,
  },
  heroCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    gap: 16,
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  heroInfo: {
    flex: 1,
    gap: 6,
  },
  companyName: {
    fontSize: 24,
    fontWeight: "700",
    lineHeight: 30,
  },
  companySubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
  detailGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  detailCard: {
    minWidth: "47%",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  detailCardText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  metricsRow: {
    flexDirection: "row",
    gap: 10,
  },
  metricCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
    gap: 4,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: "700",
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  primaryActions: {
    flexDirection: "row",
    gap: 10,
  },
  followButton: {
    flex: 1,
  },
  actionButton: {
    minWidth: 110,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  contactCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  contactRow: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  contactRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  contactTextWrap: {
    flex: 1,
    gap: 2,
  },
  contactLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  contactValue: {
    fontSize: 13,
    lineHeight: 18,
  },
});
