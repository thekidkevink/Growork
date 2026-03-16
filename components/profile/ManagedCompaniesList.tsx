import { useThemeColor, useAuth, usePermissions } from "@/hooks";
import { useCompanies } from "@/hooks/companies";
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
import { Company } from "@/types/company";
import { useRouter } from "expo-router";
import {
  Spacing,
  BorderRadius,
  Typography,
  Shadows,
} from "@/constants/DesignSystem";

export default function ManagedCompaniesList() {
  const router = useRouter();
  const { isBusinessUser } = usePermissions();
  const { companies, loading, error } = useCompanies();
  const colorScheme = useColorScheme() ?? "light";
  const borderColor = useThemeColor({}, "border");
  const backgroundColor = useThemeColor({}, "background");
  const backgroundSecondary = useThemeColor({}, "backgroundSecondary");
  const textColor = useThemeColor({}, "text");
  const mutedTextColor = useThemeColor({}, "mutedText");
  const tintColor = useThemeColor({}, "tint");

  const getStatusText = (company: Company) => {
    const status = company.status ?? company.verification_status ?? "pending";
    if (status === "approved" || status === "verified") return "Active";
    if (status === "rejected") return "Rejected";
    return "Pending";
  };

  const getStatusColor = (company: Company) => {
    const status = company.status ?? company.verification_status ?? "pending";
    if (status === "approved" || status === "verified") return "#10b981";
    if (status === "rejected") return "#ef4444";
    return "#f59e0b";
  };

  const getStatusBackground = (company: Company) => {
    const status = company.status ?? company.verification_status ?? "pending";
    if (status === "approved" || status === "verified") return "#10b98115";
    if (status === "rejected") return "#ef444415";
    return "#f59e0b15";
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <Feather name="home" size={40} color={mutedTextColor} />
        <ThemedText style={[styles.loadingText, { color: mutedTextColor }]}>
          Loading managed companies...
        </ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <Feather name="alert-circle" size={48} color="#FF3B30" />
        <ThemedText style={[styles.errorText, { color: "#FF3B30" }]}>
          {error}
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.headerRow}>
        <ThemedText style={[styles.headerTitle, { color: textColor }]}>
          Companies I Manage
        </ThemedText>
        {isBusinessUser && (
          <Pressable
            style={({ pressed }) => [
              styles.addButton,
              {
                backgroundColor: pressed ? tintColor + "20" : tintColor + "15",
              },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/profile/CompanyManagement");
            }}
          >
            <Feather name="plus" size={16} color={tintColor} />
            <ThemedText style={[styles.addButtonText, { color: tintColor }]}>
              Add New
            </ThemedText>
          </Pressable>
        )}
      </View>

      {companies.length === 0 ? (
        <View
          style={[styles.emptyState, { backgroundColor: backgroundSecondary }]}
        >
          <View
            style={[styles.emptyIcon, { backgroundColor: tintColor + "15" }]}
          >
            <Feather name="home" size={32} color={tintColor} />
          </View>
          {isBusinessUser ? (
            <>
              <ThemedText style={[styles.emptyTitle, { color: textColor }]}>
                Start managing your companies
              </ThemedText>
              <ThemedText
                style={[
                  styles.emptyDescription,
                  { color: mutedTextColor },
                  styles.textCenter,
                ]}
              >
                Create your first company profile to start publishing and managing your company presence.
              </ThemedText>
            </>
          ) : (
            <>
              <ThemedText style={[styles.emptyTitle, { color: textColor }]}>
                No companies to manage
              </ThemedText>
              <ThemedText
                style={[
                  styles.emptyDescription,
                  { color: mutedTextColor },
                  styles.textCenter,
                ]}
              >
                Create a company when you&apos;re ready to unlock business tools and company management.
              </ThemedText>
            </>
          )}
        </View>
      ) : (
        <ThemedView style={styles.companiesList}>
          {companies.map((company: Company) => (
            <Pressable
              key={company.id}
              style={({ pressed }) => [
                styles.companyCard,
                {
                  backgroundColor: pressed
                    ? backgroundSecondary
                    : backgroundColor,
                  borderColor,
                  shadowColor: colorScheme === "dark" ? "#000" : "#000",
                },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(`/profile/CompanyManagement?id=${company.id}`);
              }}
            >
              <Image
                source={{
                  uri:
                    company.logo_url ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      company.name
                    )}&size=64&background=10b981&color=ffffff`,
                }}
                style={styles.companyLogo}
              />
              <ThemedView style={styles.companyInfo}>
                <ThemedText style={[styles.companyName, { color: textColor }]}>
                  {company.name}
                </ThemedText>
                {company.description && (
                  <ThemedText
                    style={[
                      styles.companyDescription,
                      { color: mutedTextColor },
                    ]}
                  >
                    {company.description}
                  </ThemedText>
                )}
                <ThemedView style={styles.companyMeta}>
                  {company.industry && (
                    <View
                      style={[
                        styles.metaChip,
                        { backgroundColor: tintColor + "15" },
                      ]}
                    >
                      <ThemedText
                        style={[styles.metaChipText, { color: tintColor }]}
                      >
                        {company.industry}
                      </ThemedText>
                    </View>
                  )}
                  {company.location && (
                    <View
                      style={[
                        styles.metaChip,
                        { backgroundColor: mutedTextColor + "15" },
                      ]}
                    >
                      <ThemedText
                        style={[styles.metaChipText, { color: mutedTextColor }]}
                      >
                        {company.location}
                      </ThemedText>
                    </View>
                  )}
                  <View
                    style={[
                      styles.statusChip,
                      { backgroundColor: getStatusBackground(company) },
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.statusChipText,
                        { color: getStatusColor(company) },
                      ]}
                    >
                      {getStatusText(company)}
                    </ThemedText>
                  </View>
                </ThemedView>
              </ThemedView>
              <View
                style={[
                  styles.chevronContainer,
                  { backgroundColor: tintColor + "15" },
                ]}
              >
                <Feather name="edit-3" size={16} color={tintColor} />
              </View>
            </Pressable>
          ))}
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "column",
    alignItems: "center",
    gap: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  headerRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  headerTitle: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  addButtonText: {
    fontWeight: Typography.medium,
    fontSize: Typography.sm,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.sm,
  },
  errorText: {
    marginTop: Spacing.md,
    fontSize: Typography.sm,
    textAlign: "center",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing["2xl"],
    width: "100%",
    borderRadius: BorderRadius.xl,
    marginHorizontal: Spacing.lg,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.semibold,
    marginBottom: Spacing.sm,
  },
  emptyDescription: {
    fontSize: Typography.sm,
    lineHeight: Typography.lineHeight.normal * Typography.sm,
    marginBottom: Spacing.lg,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  textCenter: {
    textAlign: "center",
  },
  companiesList: {
    width: "100%",
    flexDirection: "column",
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  companyCard: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.md,
    ...Shadows.sm,
  },
  companyLogo: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontWeight: Typography.semibold,
    fontSize: Typography.base,
    marginBottom: Spacing.xs,
  },
  companyDescription: {
    fontSize: Typography.sm,
    marginBottom: Spacing.sm,
    lineHeight: Typography.lineHeight.normal * Typography.sm,
  },
  companyMeta: {
    flexDirection: "row",
    gap: Spacing.sm,
    flexWrap: "wrap",
  },
  metaChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  metaChipText: {
    fontSize: Typography.xs,
    fontWeight: Typography.medium,
  },
  statusChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  statusChipText: {
    fontSize: Typography.xs,
    fontWeight: Typography.medium,
  },
  chevronContainer: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
});
