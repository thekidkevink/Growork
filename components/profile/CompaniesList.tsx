import { useThemeColor, useAuth, usePermissions } from "@/hooks";
import { useCompanyFollows } from "@/hooks/companies";
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

export default function CompaniesList() {
  const router = useRouter();
  const { isBusinessUser } = usePermissions();
  const { companies, loading, error } = useCompanyFollows();
  const colorScheme = useColorScheme() ?? "light";
  const borderColor = useThemeColor({}, "border");
  const backgroundColor = useThemeColor({}, "background");
  const backgroundSecondary = useThemeColor({}, "backgroundSecondary");
  const textColor = useThemeColor({}, "text");
  const mutedTextColor = useThemeColor({}, "mutedText");
  const tintColor = useThemeColor({}, "tint");

  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <Feather name="briefcase" size={40} color={mutedTextColor} />
        <ThemedText style={[styles.loadingText, { color: mutedTextColor }]}>
          Loading followed companies...
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
          Companies I Follow
        </ThemedText>
      </View>

      {companies.length === 0 ? (
        <View
          style={[styles.emptyState, { backgroundColor: backgroundSecondary }]}
        >
          <View
            style={[styles.emptyIcon, { backgroundColor: tintColor + "15" }]}
          >
            <Feather name="briefcase" size={32} color={tintColor} />
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
                Create your first company profile to unlock publishing and company management tools.
              </ThemedText>
            </>
          ) : (
            <>
              <ThemedText style={[styles.emptyTitle, { color: textColor }]}>
                Follow companies you&apos;re interested in
              </ThemedText>
              <ThemedText
                style={[
                  styles.emptyDescription,
                  { color: mutedTextColor },
                  styles.textCenter,
                ]}
              >
                Browse companies and tap follow to keep their updates and openings close by.
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
                if (isBusinessUser) {
                  router.push(`/profile/CompanyManagement?id=${company.id}`);
                } else {
                  router.push(`/company/${company.id}`);
                }
              }}
            >
              <Image
                source={{
                  uri:
                    company.logo_url ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      company.name
                    )}&size=64&background=2563eb&color=ffffff`,
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
                </ThemedView>
              </ThemedView>
              <View
                style={[
                  styles.chevronContainer,
                  { backgroundColor: tintColor + "15" },
                ]}
              >
                <Feather name="chevron-right" size={16} color={tintColor} />
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
  chevronContainer: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
});
