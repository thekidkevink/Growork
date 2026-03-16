import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "../ThemedText";
import { ThemedAvatar } from "../ui/ThemedAvatar";
import { useThemeColor, usePermissions } from "@/hooks";
import { useCompanies } from "@/hooks/companies";
import { Company } from "@/types/company";
import { useRouter } from "expo-router";
import { Spacing, BorderRadius, Typography } from "@/constants/DesignSystem";

interface ManagedCompaniesSheetProps {
  onClose?: () => void;
}

export default function ManagedCompaniesSheet({
  onClose,
}: ManagedCompaniesSheetProps) {
  const router = useRouter();
  const { isBusinessUser } = usePermissions();
  const { companies, loading, error } = useCompanies();
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

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <ThemedText style={[styles.headerTitle, { color: textColor }]}>
            Companies I Manage
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
            Companies I Manage
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
          Companies I Manage
        </ThemedText>
        {companies.length > 0 && (
          <ThemedText style={[styles.countText, { color: mutedTextColor }]}>
            {companies.length}
          </ThemedText>
        )}
        {isBusinessUser && (
          <Pressable
            style={styles.addButton}
            onPress={() => {
              router.push("/profile/CompanyManagement");
              onClose?.();
            }}
          >
            <Feather name="plus" size={20} color={tintColor} />
          </Pressable>
        )}
      </View>

      {companies.length === 0 ? (
        <View style={styles.emptyState}>
          <Feather name="home" size={32} color={mutedTextColor} />
          {isBusinessUser ? (
            <>
              <ThemedText style={[styles.emptyTitle, { color: textColor }]}>
                Start managing your companies
              </ThemedText>
              <ThemedText
                style={[styles.emptyDescription, { color: mutedTextColor }]}
              >
                Create your first company profile to start posting jobs and news
              </ThemedText>
              <Pressable
                style={[
                  styles.emptyAddButton,
                  { backgroundColor: tintColor + "20" },
                ]}
                onPress={() => {
                  router.push("/profile/CompanyManagement");
                  onClose?.();
                }}
              >
                <Feather name="plus" size={16} color={tintColor} />
                <ThemedText
                  style={[styles.addButtonText, { color: tintColor }]}
                >
                  Create Company
                </ThemedText>
              </Pressable>
            </>
          ) : (
            <>
              <ThemedText style={[styles.emptyTitle, { color: textColor }]}>
                No companies to manage
              </ThemedText>
              <ThemedText
                style={[styles.emptyDescription, { color: mutedTextColor }]}
              >
                Create a company when you&apos;re ready to unlock business tools and company management
              </ThemedText>
            </>
          )}
        </View>
      ) : (
        <View style={styles.companiesList}>
          {companies.map((company: Company) => (
            <Pressable
              key={company.id}
              style={styles.companyItem}
              onPress={() => {
                router.push(`/profile/CompanyManagement?id=${company.id}`);
                onClose?.();
              }}
            >
              <ThemedAvatar
                size={40}
                image={
                  company.logo_url ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    company.name
                  )}&size=40&background=10b981&color=ffffff`
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
                <View style={styles.companyMeta}>
                  {company.industry && (
                    <ThemedText
                      style={[styles.metaText, { color: mutedTextColor }]}
                    >
                      {company.industry}
                    </ThemedText>
                  )}
              <ThemedText
                    style={[
                      styles.statusText,
                      { color: getStatusColor(company) },
                    ]}
                  >
                    {getStatusText(company)}
                  </ThemedText>
                </View>
              </View>
              <Feather name="edit-3" size={16} color={mutedTextColor} />
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
    marginBottom: Spacing.lg,
  },
  addButton: {
    padding: Spacing.xs,
  },
  emptyAddButton: {
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
    flexDirection: "row",
    gap: Spacing.sm,
    alignItems: "center",
  },
  metaText: {
    fontSize: Typography.xs,
    fontWeight: Typography.medium,
  },
  statusText: {
    fontSize: Typography.xs,
    fontWeight: Typography.medium,
  },
  countText: {
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
    marginLeft: Spacing.sm,
  },
});
