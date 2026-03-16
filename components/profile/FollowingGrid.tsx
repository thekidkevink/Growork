import { useCompanyFollows, useThemeColor } from "@/hooks";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { ThemedText } from "../ThemedText";

function Badge({ label }: { label: string }) {
  const borderColor = useThemeColor({}, "border");
  const textColor = useThemeColor({}, "text");

  return (
    <View style={[styles.badge, { borderColor }]}>
      <ThemedText style={[styles.badgeText, { color: textColor }]}>
        {label}
      </ThemedText>
    </View>
  );
}

export default function FollowingGrid() {
  const router = useRouter();
  const { companies, loading } = useCompanyFollows();
  const borderColor = useThemeColor({}, "border");
  const backgroundColor = useThemeColor({}, "background");
  const tintColor = useThemeColor({}, "tint");
  const mutedTextColor = useThemeColor({}, "mutedText");
  const textColor = useThemeColor({}, "text");

  const handleDiscoverCompanies = () => {
    router.push("/profile/companies");
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <ThemedText style={styles.headerTitle}>Following</ThemedText>
        <Pressable
          onPress={() => {
            if (process.env.EXPO_OS === "ios") {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            handleDiscoverCompanies();
          }}
        >
          <ThemedText style={[styles.discoverText, { color: tintColor }]}>
            Manage
          </ThemedText>
        </Pressable>
      </View>

      {!loading && companies.length === 0 ? (
        <Pressable
          style={({ pressed }) => [
            styles.emptyState,
            { opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={handleDiscoverCompanies}
        >
          <Feather name="briefcase" size={48} color={mutedTextColor} />
          <ThemedText style={[styles.emptyTitle, { color: textColor }]}>
            No Companies Followed Yet
          </ThemedText>
          <ThemedText
            style={[styles.emptyDescription, { color: mutedTextColor }]}
          >
            Follow companies to keep up with their updates and opportunities.
          </ThemedText>
        </Pressable>
      ) : (
        <View style={styles.grid}>
          {companies.slice(0, 4).map((company) => (
            <Pressable
              key={company.id}
              style={({ pressed }) => [
                styles.card,
                {
                  borderColor,
                  backgroundColor: pressed ? backgroundColor : "transparent",
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
              onPress={() => {
                if (process.env.EXPO_OS === "ios") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                router.push(`/company/${company.id}`);
              }}
            >
              <Image
                source={{
                  uri:
                    company.logo_url ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      company.name || "Company"
                    )}&size=128`,
                }}
                style={styles.avatar}
              />
              <ThemedText style={[styles.cardTitle, { color: textColor }]}>
                {company.name}
              </ThemedText>
              <Badge label={company.industry || "Company"} />
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
    paddingTop: 8,
  },
  headerRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  discoverText: {
    fontWeight: "500",
    fontSize: 14,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 16,
  },
  grid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
  },
  card: {
    width: "48%",
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 12,
    gap: 12,
    marginBottom: 12,
    marginHorizontal: "1%",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 12,
    marginBottom: 4,
  },
  cardTitle: {
    fontWeight: "600",
    fontSize: 14,
    marginBottom: 4,
    textAlign: "center",
  },
  badge: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 4,
  },
  badgeText: {
    fontWeight: "500",
    fontSize: 11,
  },
});
