import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  StatusBar,
  useColorScheme,
  StyleSheet,
  TouchableOpacity,
  Share,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { Company } from "../../types/company";
import ScreenContainer from "../../components/ScreenContainer";
import { ThemedText } from "../../components/ThemedText";
import { ThemedView } from "../../components/ThemedView";
import ThemedButton from "../../components/ui/ThemedButton";
import { CompanyHeader, CompanyPosts } from "../../components/company";
import { useCompanies } from "../../hooks/companies";
import { useCompanyFollows } from "../../hooks/companies/useCompanyFollows";
import { useAuth } from "../../hooks/auth";
import { useThemeColor } from "../../hooks";
import { useCompanyPosts } from "../../hooks/posts";
import { supabase } from "../../utils/supabase";

export default function CompanyDetailsScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const colorScheme = useColorScheme();
  useAuth();
  const { getCompanyByIdPublic } = useCompanies();
  const { followCompany, unfollowCompany, isFollowingCompany } =
    useCompanyFollows();
  const { posts } = useCompanyPosts(id || "");

  // Theme colors
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "border");
  const mutedTextColor = useThemeColor({}, "mutedText");
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  // Calculate counts from the actual posts data
  const postsCount = posts?.length || 0;
  const jobsCount = posts?.filter((post) => post.type === "job").length || 0;

  // Load company details
  useEffect(() => {
    const loadCompany = async () => {
      if (!id) {
        setCompany(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { company: companyResult, error } = await getCompanyByIdPublic(
          id
        );

        if (error) {
          return;
        }

        if (companyResult) {
          setCompany(companyResult);
          // Check if user is following this company
          const followingStatus = await isFollowingCompany(id);
          setIsFollowing(followingStatus);

          const { count, error: followersError } = await supabase
            .from("company_follows")
            .select("id", { count: "exact", head: true })
            .eq("company_id", id);

          if (!followersError) {
            setFollowersCount(count || 0);
          }
        }
      } catch (_error) {
        setCompany(null);
      } finally {
        setLoading(false);
      }
    };

    loadCompany();
  }, [id, getCompanyByIdPublic, isFollowingCompany]);

  const handleFollowToggle = async () => {
    if (!id || followLoading) return;

    try {
      setFollowLoading(true);

      if (isFollowing) {
        const result = await unfollowCompany(id);
        if (!result.error) {
          setIsFollowing(false);
          setFollowersCount((current) => Math.max(current - 1, 0));
        }
      } else {
        const result = await followCompany(id);
        if (!result.error) {
          setIsFollowing(true);
          setFollowersCount((current) => current + 1);
        }
      }
    } catch (_error) {
      Alert.alert("Unavailable", "We could not update your follow status right now.");
    } finally {
      setFollowLoading(false);
    }
  };

  const handleShareCompany = async () => {
    if (!company) {
      return;
    }

    try {
      const companyUrl = id ? `https://growork.app/company/${id}` : "https://growork.app";
      await Share.share({
        title: company.name || "Company",
        message: `Check out ${company.name || "this company"} on GROWORK: ${companyUrl}`,
        url: companyUrl,
      });
    } catch {
      Alert.alert("Share unavailable", "We could not open the share sheet right now.");
    }
  };

  if (loading) {
    return (
      <ScreenContainer>
        <StatusBar
          barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
        />
        <View style={styles.loadingContainer}>
          <Feather
            name="home"
            size={48}
            color={mutedTextColor}
            style={{ marginBottom: 16 }}
          />
          <ThemedText style={[styles.loadingText, { color: mutedTextColor }]}>
            Loading company...
          </ThemedText>
        </View>
      </ScreenContainer>
    );
  }

  if (!company) {
    return (
      <ScreenContainer>
        <StatusBar
          barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
        />
        <View style={styles.loadingContainer}>
          <Feather
            name="home"
            size={48}
            color={mutedTextColor}
            style={{ marginBottom: 16 }}
          />
          <ThemedText style={[styles.loadingText, { color: mutedTextColor }]}>
            Company not found
          </ThemedText>
          <ThemedButton
            title="Go Back"
            onPress={() => router.back()}
            variant="outline"
            style={{ marginTop: 16 }}
          />
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
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.back()}
          >
            <Feather name="arrow-left" size={20} color={textColor} />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Company</ThemedText>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleShareCompany}
          >
            <Feather name="share" size={20} color={textColor} />
          </TouchableOpacity>
        </View>
      </ThemedView>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Company Header with integrated stats */}
        <CompanyHeader
          company={company}
          isFollowing={isFollowing}
          onFollowToggle={handleFollowToggle}
          loading={followLoading}
          followersCount={followersCount}
          postsCount={postsCount}
          jobsCount={jobsCount}
        />

        {/* Company Posts */}
        <CompanyPosts companyId={id || ""} posts={company?.posts} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 10,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    padding: 10,
    borderRadius: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 16,
  },
});
