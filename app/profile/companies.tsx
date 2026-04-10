import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

import {
  useAuth,
  useThemeColor,
  usePermissions,
  useCompanyFollows,
} from "@/hooks";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import ScreenContainer from "@/components/ScreenContainer";
import UniversalHeader from "@/components/ui/UniversalHeader";
import { supabase } from "@/utils/supabase";
import { Company } from "@/types";
import ActionPromptModal from "@/components/ui/ActionPromptModal";
import { useFlashToast } from "@/components/ui/Flash";

export default function CompaniesManagement() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { isBusinessUser } = usePermissions();
  const colorScheme = useColorScheme();
  const textColor = useThemeColor({}, "text");
  const backgroundColor = useThemeColor({}, "background");
  const borderColor = useThemeColor({}, "border");
  const mutedTextColor = useThemeColor({}, "mutedText");
  const tintColor = useThemeColor({}, "tint");
  const cardBg = useThemeColor({}, "backgroundSecondary");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [showBusinessPrompt, setShowBusinessPrompt] = useState(false);
  const { companies: followedCompanies, loading: followsLoading } =
    useCompanyFollows();
  const [loading, setLoading] = useState(true);
  const toast = useFlashToast();
  const companyLimit =
    typeof profile?.company_limit_override === "number" &&
    Number.isFinite(profile.company_limit_override) &&
    profile.company_limit_override >= 0
      ? profile.company_limit_override
      : 2;
  const hasReachedCompanyLimit = companies.length >= companyLimit;

  useEffect(() => {
    if (user) {
      fetchCompanies();
    }
  }, [user]);

  const fetchCompanies = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .or(`user_id.eq.${user.id},owner_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCompanies(data || []);
    } catch (_error: any) {
      toast.show({
        type: "danger",
        title: "Error",
        message: "Failed to load companies",
      });
    } finally {
      setLoading(false);
    }
  };

  // Followed companies are handled by useCompanyFollows

  const handleCreateCompany = () => {
    if (!isBusinessUser) {
      setShowBusinessPrompt(true);
      return;
    }
    if (hasReachedCompanyLimit) {
      toast.show({
        type: "info",
        title: "Company limit reached",
        message: `This account can create up to ${companyLimit} company ${
          companyLimit === 1 ? "profile" : "profiles"
        }.`,
      });
      return;
    }
    router.push("/profile/CompanyManagement");
  };

  const handleEditCompany = (companyId: string) => {
    router.push(`/profile/CompanyManagement?id=${companyId}`);
  };

  const handleFollowCompany = () => {
    router.push("/(tabs)/search");
  };

  if (loading) {
    return (
      <ScreenContainer>
        <StatusBar
          barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
        />
        <UniversalHeader
          title="Companies"
          centerTitle={true}
          showBackButton={true}
          showNotifications={false}
        />
        <View style={styles.loadingContainer}>
          <Feather name="briefcase" size={40} color={mutedTextColor} />
          <ThemedText style={[styles.loadingText, { color: mutedTextColor }]}>
            Loading companies...
          </ThemedText>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ActionPromptModal
        visible={showBusinessPrompt}
        title="Business setup required"
        message="Request business access first. Once an admin approves it, you can create and manage companies here."
        cancelLabel="Not now"
        confirmLabel="Request access"
        onCancel={() => setShowBusinessPrompt(false)}
        onConfirm={() => {
          setShowBusinessPrompt(false);
          router.push("/profile/business-request");
        }}
      />
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
      />

      <UniversalHeader
        title="Companies"
        centerTitle={true}
        showBackButton={true}
        showNotifications={false}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* For Business Users: Show My Companies first, then Followed Companies */}
        {isBusinessUser && (
          <ThemedView style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>My Companies</ThemedText>
              <TouchableOpacity
                style={[styles.addButton, { borderColor }]}
                onPress={handleCreateCompany}
                disabled={hasReachedCompanyLimit}
              >
                <Feather name="plus" size={16} color={textColor} />
                <ThemedText
                  style={[styles.addButtonText, { color: textColor }]}
                >
                  Create
                </ThemedText>
              </TouchableOpacity>
            </View>
            <ThemedText
              style={[styles.limitHint, { color: mutedTextColor }]}
            >
              {hasReachedCompanyLimit
                ? `You have reached this account's company limit of ${companyLimit}.`
                : `${Math.max(companyLimit - companies.length, 0)} of ${companyLimit} company slots remaining.`}
            </ThemedText>

            {companies.length === 0 ? (
              <ThemedView style={styles.emptyState}>
                <Feather name="briefcase" size={48} color={mutedTextColor} />
                <ThemedText style={[styles.emptyTitle, { color: textColor }]}>
                  No Companies Yet
                </ThemedText>
                <ThemedText
                  style={[styles.emptyDescription, { color: mutedTextColor }]}
                >
                  Create your first company profile to start publishing jobs,
                  updates, and your company presence.
                </ThemedText>
                <TouchableOpacity
                  style={[styles.createButton, { borderColor }]}
                  onPress={handleCreateCompany}
                >
                  <ThemedText
                    style={[styles.createButtonText, { color: textColor }]}
                  >
                    Create Company
                  </ThemedText>
                </TouchableOpacity>
              </ThemedView>
            ) : (
              <View style={styles.companiesList}>
                {companies.map((company) => (
                  <TouchableOpacity
                    key={company.id}
                    style={[styles.companyCard, { borderColor }]}
                    onPress={() => handleEditCompany(company.id)}
                  >
                    <Image
                      source={{
                        uri:
                          company.logo_url ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            company.name
                          )}&size=64`,
                      }}
                      style={styles.companyLogo}
                    />
                    <View style={styles.companyInfo}>
                      <ThemedText
                        style={[styles.companyName, { color: textColor }]}
                      >
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
                      <View style={styles.companyMeta}>
                        {company.industry && (
                          <ThemedText
                            style={[
                              styles.companyMetaText,
                              { color: mutedTextColor },
                            ]}
                          >
                            {company.industry}
                          </ThemedText>
                        )}
                        {company.location && (
                          <ThemedText
                            style={[
                              styles.companyMetaText,
                              { color: mutedTextColor },
                            ]}
                          >
                            {company.location}
                          </ThemedText>
                        )}
                      </View>
                    </View>
                    <Feather
                      name="chevron-right"
                      size={16}
                      color={mutedTextColor}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ThemedView>
        )}

        {/* Followed Companies Section (for both business and normal users) */}
        <ThemedView style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>
              {isBusinessUser ? "Companies I Follow" : "Companies I Follow"}
            </ThemedText>
            <TouchableOpacity
              style={[styles.addButton, { borderColor }]}
              onPress={handleFollowCompany}
            >
              <Feather name="search" size={16} color={textColor} />
              <ThemedText style={[styles.addButtonText, { color: textColor }]}>
                Discover
              </ThemedText>
            </TouchableOpacity>
          </View>

          {followsLoading ? (
            <ThemedView style={styles.emptyState}>
              <ThemedText style={[styles.emptyTitle, { color: textColor }]}>
                Loading...
              </ThemedText>
            </ThemedView>
          ) : followedCompanies.length === 0 ? (
            <ThemedView style={styles.emptyState}>
              <Feather name="heart" size={48} color={mutedTextColor} />
              <ThemedText style={[styles.emptyTitle, { color: textColor }]}>
                No Followed Companies
              </ThemedText>
              <ThemedText
                style={[styles.emptyDescription, { color: mutedTextColor }]}
              >
                Follow companies you&apos;re interested in to see their latest
                updates and job postings.
              </ThemedText>
              <TouchableOpacity
                style={[styles.createButton, { borderColor }]}
                onPress={handleFollowCompany}
              >
                <ThemedText
                  style={[styles.createButtonText, { color: textColor }]}
                >
                  Discover Companies
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
          ) : (
            <View style={styles.companiesList}>
              {followedCompanies.map((company) => (
                <TouchableOpacity
                  key={company.id}
                  style={[styles.companyCard, { borderColor }]}
                  onPress={() => {
                    // Navigate to company profile
                    router.push(`/company/${company.id}`);
                  }}
                >
                  <Image
                    source={{
                      uri:
                        company.logo_url ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          company.name
                        )}&size=64`,
                    }}
                    style={styles.companyLogo}
                  />
                  <View style={styles.companyInfo}>
                    <ThemedText
                      style={[styles.companyName, { color: textColor }]}
                    >
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
                    <View style={styles.companyMeta}>
                      {company.industry && (
                        <ThemedText
                          style={[
                            styles.companyMetaText,
                            { color: mutedTextColor },
                          ]}
                        >
                          {company.industry}
                        </ThemedText>
                      )}
                      {company.location && (
                        <ThemedText
                          style={[
                            styles.companyMetaText,
                            { color: mutedTextColor },
                          ]}
                        >
                          {company.location}
                        </ThemedText>
                      )}
                    </View>
                  </View>
                  <Feather name="heart" size={16} color={tintColor} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ThemedView>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  headerRight: {
    width: 40,
  },
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
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  limitHint: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: -8,
    marginBottom: 16,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 6,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
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
  createButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  companiesList: {
    gap: 12,
  },
  companyCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  companyLogo: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  companyDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  companyMeta: {
    flexDirection: "row",
    gap: 12,
  },
  companyMetaText: {
    fontSize: 12,
  },
});
