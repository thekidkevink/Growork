import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "../ThemedText";
import { ThemedAvatar } from "../ui/ThemedAvatar";
import { useThemeColor, usePermissions } from "@/hooks";
import { useCompanyFollows } from "@/hooks/companies";
import { Company } from "@/types/company";
import { useRouter } from "expo-router";
import { Spacing, BorderRadius, Typography } from "@/constants/DesignSystem";

interface FollowedCompaniesSheetProps {
  onClose?: () => void;
}

export default function FollowedCompaniesSheet({
  onClose,
}: FollowedCompaniesSheetProps) {
  const router = useRouter();
  const { isBusinessUser } = usePermissions();
  const { companies, loading, error } = useCompanyFollows();
  const textColor = useThemeColor({}, "text");
  const mutedTextColor = useThemeColor({}, "mutedText");
  const tintColor = useThemeColor({}, "tint");

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <ThemedText style={[styles.headerTitle, { color: textColor }]}>
            Companies I Follow
          </ThemedText>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Feather name="x" size={24} color={mutedTextColor} />
          </Pressable>
        </View>
        <View style={styles.loadingContainer}>
          <ThemedText style={[styles.loadingText, { color: mutedTextColor }]}>
            Loading companies...
          </ThemedText>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <ThemedText style={[styles.headerTitle, { color: textColor }]}>
            Companies I Follow
          </ThemedText>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Feather name="x" size={24} color={mutedTextColor} />
          </Pressable>
        </View>
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={48} color="#FF3B30" />
          <ThemedText style={[styles.errorText, { color: "#FF3B30" }]}>
            {error}
          </ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={[styles.headerTitle, { color: textColor }]}>
          Companies I Follow
        </ThemedText>
        {companies.length > 0 && (
          <ThemedText style={[styles.countText, { color: mutedTextColor }]}>
            {companies.length}
          </ThemedText>
        )}
      </View>

      {companies.length === 0 ? (
        <View style={styles.emptyState}>
          <Feather name="briefcase" size={32} color={mutedTextColor} />
          <ThemedText style={[styles.emptyTitle, { color: textColor }]}>
            No companies followed yet
          </ThemedText>
          <ThemedText
            style={[styles.emptyDescription, { color: mutedTextColor }]}
          >
            Start following companies to see their updates here
          </ThemedText>
        </View>
      ) : (
        <View style={styles.companiesList}>
          {companies.map((company: Company) => (
            <Pressable
              key={company.id}
              style={styles.companyItem}
              onPress={() => {
                router.push(`/company/${company.id}`);
                onClose?.();
              }}
            >
              <ThemedAvatar
                size={40}
                image={
                  company.logo_url ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    company.name
                  )}&size=40&background=2563eb&color=ffffff`
                }
                square={true}
              />
              <View style={styles.companyInfo}>
                <ThemedText style={[styles.companyName, { color: textColor }]}>
                  {company.name}
                </ThemedText>
                {company.description && (
                  <ThemedText
                    style={[
                      styles.companyDescription,
                      { color: mutedTextColor },
                    ]}
                    numberOfLines={1}
                  >
                    {company.description}
                  </ThemedText>
                )}
                {company.industry && (
                  <ThemedText
                    style={[styles.companyMeta, { color: mutedTextColor }]}
                  >
                    {company.industry}
                  </ThemedText>
                )}
              </View>
              <Feather name="chevron-right" size={16} color={mutedTextColor} />
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: Spacing.lg,
    marginBottom: Spacing.lg,
  },

  headerTitle: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: Typography.base,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.md,
  },
  errorText: {
    fontSize: Typography.base,
    textAlign: "center",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing["2xl"],
    gap: Spacing.md,
  },
  emptyTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.semibold,
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: Typography.sm,
    textAlign: "center",
    lineHeight: Typography.lineHeight.normal * Typography.sm,
  },
  companiesList: {
    flex: 1,
  },
  companyItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    gap: Spacing.md,
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
    marginBottom: Spacing.xs,
    lineHeight: Typography.lineHeight.normal * Typography.sm,
  },
  companyMeta: {
    fontSize: Typography.xs,
    fontWeight: Typography.medium,
  },
  countText: {
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
    marginLeft: Spacing.sm,
  },
});
