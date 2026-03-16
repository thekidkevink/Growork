import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";

import ScreenContainer from "@/components/ScreenContainer";
import SearchBar from "./components/SearchBar";
import FilterTabs from "./components/FilterTabs";
import IndustryFilter from "./components/IndustryFilter";
import ContentCard from "@/components/content/ContentCard";
import { useBottomSheetManager } from "@/components/content/BottomSheetManager";
import { SearchResultsSkeleton } from "@/components/ui/Skeleton";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useAuth, useSearch, useThemeColor } from "@/hooks";
import { PostType } from "@/types/enums";
import { BorderRadius, Colors, Spacing, Typography } from "@/constants/DesignSystem";
import type { FilterKey } from "@/constants/searchConfig";
import type { SearchResult } from "@/hooks/search/useSearch";

const filterOptions = [
  { key: "all" as FilterKey, label: "All" },
  { key: "jobs" as FilterKey, label: "Jobs" },
  { key: "news" as FilterKey, label: "News" },
];

export default function SearchClient() {
  const { user } = useAuth();
  const tintColor = useThemeColor({}, "tint");
  const accentContrast = useThemeColor({}, "accentContrast");
  const mutedTextColor = useThemeColor({}, "mutedText");
  const cardColor = useThemeColor({}, "backgroundSecondary");
  const pillColor = useThemeColor({}, "backgroundTertiary");
  const borderColor = useThemeColor({}, "border");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<FilterKey>("all");
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const { results, loading, error, search, clearResults } = useSearch();
  const { openJobApplicationSheet } = useBottomSheetManager();

  const selectedType = useMemo(() => {
    switch (selectedFilter) {
      case "jobs":
        return PostType.Job;
      case "news":
        return PostType.News;
      default:
        return undefined;
    }
  }, [selectedFilter]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      clearResults();
      return;
    }

    search(searchTerm, selectedType, selectedIndustry ?? undefined);
  }, [clearResults, search, searchTerm, selectedIndustry, selectedType]);

  const filteredResults = useMemo(
    () =>
      results.filter((result: SearchResult) => {
        if (selectedFilter === "all") {
          return true;
        }

        if (selectedFilter === "jobs") {
          return result.type === PostType.Job;
        }

        return result.type === PostType.News;
      }),
    [results, selectedFilter]
  );

  const counts = useMemo(
    () => ({
      all: results.length,
      jobs: results.filter((item) => item.type === PostType.Job).length,
      news: results.filter((item) => item.type === PostType.News).length,
    }),
    [results]
  );

  const summaryTitle = useMemo(() => {
    if (!searchTerm.trim()) {
      return "Search across jobs and updates";
    }

    switch (selectedFilter) {
      case "jobs":
        return "Search jobs";
      case "news":
        return "Search news";
      default:
        return "Search the network";
    }
  }, [searchTerm, selectedFilter]);

  const summarySubtitle = useMemo(() => {
    if (!searchTerm.trim()) {
      return "Look up openings, industry news, and company content in one familiar place.";
    }

    if (selectedIndustry) {
      return `Showing ${selectedFilter === "all" ? "results" : selectedFilter} for "${searchTerm}" in ${selectedIndustry}.`;
    }

    return `Showing ${selectedFilter === "all" ? "results" : selectedFilter} for "${searchTerm}".`;
  }, [searchTerm, selectedFilter, selectedIndustry]);

  const handleRefresh = useCallback(async () => {
    if (!searchTerm.trim()) {
      return;
    }

    setRefreshing(true);
    try {
      await search(searchTerm, selectedType, selectedIndustry ?? undefined);
    } finally {
      setRefreshing(false);
    }
  }, [search, searchTerm, selectedIndustry, selectedType]);

  const handleClear = useCallback(() => {
    setSearchTerm("");
    clearResults();
  }, [clearResults]);

  return (
    <ScreenContainer>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={tintColor}
            colors={[tintColor]}
          />
        }
      >
        <View style={styles.header}>
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            onClear={handleClear}
            placeholder="Search jobs, companies, and news"
          />
        </View>

        <View style={styles.listHeader}>
          <View style={[styles.heroCard, { backgroundColor: cardColor, borderColor }]}>
            <ThemedText style={styles.heroTitle}>{summaryTitle}</ThemedText>
            <ThemedText style={[styles.heroSubtitle, { color: mutedTextColor }]}>{summarySubtitle}</ThemedText>
            <View style={styles.heroStats}>
              <SummaryPill label="All" value={counts.all} backgroundColor={pillColor} borderColor={borderColor} labelColor={mutedTextColor} />
              <SummaryPill label="Jobs" value={counts.jobs} backgroundColor={pillColor} borderColor={borderColor} labelColor={mutedTextColor} />
              <SummaryPill label="News" value={counts.news} backgroundColor={pillColor} borderColor={borderColor} labelColor={mutedTextColor} />
              {selectedIndustry ? (
                <SummaryPill label="Industry" value={selectedIndustry} backgroundColor={pillColor} borderColor={borderColor} labelColor={mutedTextColor} />
              ) : null}
            </View>
          </View>
        </View>

        <ThemedView style={styles.filtersSection}>
          <FilterTabs
            options={filterOptions}
            selectedFilter={selectedFilter}
            setSelectedFilter={setSelectedFilter}
            counts={counts}
          />

          <IndustryFilter
            selectedIndustry={selectedIndustry}
            setSelectedIndustry={(industry) =>
              setSelectedIndustry(industry === "All" ? null : industry)
            }
          />
        </ThemedView>

        <View style={styles.resultsSection}>
          {!searchTerm.trim() ? (
            <EmptyDiscoveryState />
          ) : loading ? (
            <SearchResultsSkeleton />
          ) : filteredResults.length === 0 ? (
            <EmptyResultsState
              searchTerm={searchTerm}
              selectedFilter={selectedFilter}
              selectedIndustry={selectedIndustry}
            />
          ) : (
            <>
              <View style={styles.sectionHeader}>
                <ThemedText style={styles.sectionTitle}>
                  {filteredResults.length} result{filteredResults.length === 1 ? "" : "s"}
                </ThemedText>
                <ThemedText style={[styles.sectionSubtitle, { color: mutedTextColor }]}>
                  Discovery stays consistent here: jobs, news, and company posts in one searchable flow.
                </ThemedText>
              </View>
              {filteredResults.map((item, index) => (
                <View
                  key={`search-result-${item.id}-${index}`}
                  style={styles.resultItem}
                >
                  <ContentCard
                    variant={item.type === PostType.Job ? "job" : "news"}
                    id={item.id}
                    title={item.title || ""}
                    description={item.content || ""}
                    mainImage={getValidImage(item.image_url)}
                    createdAt={item.created_at}
                    criteria={item.criteria || undefined}
                    onPressApply={
                      item.type === PostType.Job
                        ? () =>
                            openJobApplicationSheet(item, {
                              onSuccess: () => {},
                            })
                        : undefined
                    }
                    user_id={item.user_id}
                    isOwnedByCurrentUser={
                      item.type === PostType.Job && !!user?.id && item.user_id === user.id
                    }
                    ownerBadgeLabel="Your listing"
                    ownerActionLabel="Manage"
                    authorName={getAuthorName(item)}
                    authorAvatarUrl={item.profiles?.avatar_url || undefined}
                  />
                </View>
              ))}
            </>
          )}

          {error ? (
            <View style={styles.footerError}>
              <ThemedText style={styles.footerErrorText}>
                We hit a snag while searching. Pull to refresh or try again.
              </ThemedText>
              <Pressable
                style={[styles.retryButton, { backgroundColor: tintColor }]}
                onPress={() =>
                  search(searchTerm, selectedType, selectedIndustry ?? undefined)
                }
              >
                <ThemedText style={[styles.retryButtonText, { color: accentContrast }]}>Retry</ThemedText>
              </Pressable>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function SummaryPill({
  label,
  value,
  backgroundColor,
  borderColor,
  labelColor,
}: {
  label: string;
  value: number | string;
  backgroundColor: string;
  borderColor: string;
  labelColor: string;
}) {
  return (
    <View style={[styles.summaryPill, { backgroundColor, borderColor }]}> 
      <ThemedText style={[styles.summaryPillLabel, { color: labelColor }]}>{label}</ThemedText>
      <ThemedText style={styles.summaryPillValue}>{String(value)}</ThemedText>
    </View>
  );
}

function EmptyDiscoveryState() {
  const mutedTextColor = useThemeColor({}, "mutedText");
  const iconCircleColor = useThemeColor({}, "backgroundTertiary");

  return (
    <View style={styles.emptyContainer}>
      <View style={[styles.iconCircle, { backgroundColor: iconCircleColor }]}> 
        <Feather name="compass" size={32} color={mutedTextColor} />
      </View>
      <ThemedText style={styles.emptyTitle}>Start with a keyword</ThemedText>
      <ThemedText style={[styles.emptyText, { color: mutedTextColor }]}>
        Search for roles, company updates, or industry news. Use the same filters you know from Home to stay in the flow.
      </ThemedText>
    </View>
  );
}

function EmptyResultsState({
  searchTerm,
  selectedFilter,
  selectedIndustry,
}: {
  searchTerm: string;
  selectedFilter: FilterKey;
  selectedIndustry: string | null;
}) {
  const mutedTextColor = useThemeColor({}, "mutedText");
  const iconCircleColor = useThemeColor({}, "backgroundTertiary");

  return (
    <View style={styles.emptyContainer}>
      <View style={[styles.iconCircle, { backgroundColor: iconCircleColor }]}> 
        <Feather name="search" size={32} color={mutedTextColor} />
      </View>
      <ThemedText style={styles.emptyTitle}>No results found</ThemedText>
      <ThemedText style={[styles.emptyText, { color: mutedTextColor }]}>
        {buildEmptyMessage(searchTerm, selectedFilter, selectedIndustry)}
      </ThemedText>
    </View>
  );
}

function buildEmptyMessage(
  searchTerm: string,
  selectedFilter: FilterKey,
  selectedIndustry: string | null
) {
  if (selectedIndustry) {
    return `We couldn't find ${selectedFilter === "all" ? "results" : selectedFilter} for "${searchTerm}" in ${selectedIndustry}. Try a broader search or another industry.`;
  }

  return `We couldn't find ${selectedFilter === "all" ? "results" : selectedFilter} for "${searchTerm}". Try another keyword or switch filters.`;
}

function getAuthorName(item: SearchResult) {
  const name = item.profiles?.name?.trim();
  const surname = item.profiles?.surname?.trim();
  const fullName = [name, surname].filter(Boolean).join(" ").trim();
  return fullName || item.company_name || item.criteria?.company || undefined;
}

function getValidImage(imageUrl?: string | null) {
  if (!imageUrl || !imageUrl.trim()) {
    return undefined;
  }

  try {
    new URL(imageUrl);
    return imageUrl;
  } catch {
    return undefined;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing["4xl"],
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  listHeader: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  heroCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  heroTitle: {
    fontSize: Typography.xl,
    fontWeight: Typography.semibold,
  },
  heroSubtitle: {
    fontSize: Typography.sm,
    lineHeight: 20,
  },
  heroStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  summaryPill: {
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  summaryPillLabel: {
    fontSize: Typography.sm,
  },
  summaryPillValue: {
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
  },
  filtersSection: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  resultsSection: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  sectionHeader: {
    gap: Spacing.xs,
    paddingTop: Spacing.xs,
  },
  sectionTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.semibold,
  },
  sectionSubtitle: {
    fontSize: Typography.sm,
    lineHeight: 20,
  },
  resultItem: {
    marginBottom: Spacing.sm,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing["4xl"],
    gap: Spacing.md,
  },
  iconCircle: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.full,
  },
  emptyTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.semibold,
    textAlign: "center",
  },
  emptyText: {
    fontSize: Typography.base,
    lineHeight: 22,
    textAlign: "center",
  },
  footerError: {
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  footerErrorText: {
    color: Colors.error,
    fontSize: Typography.sm,
    textAlign: "center",
  },
  retryButton: {
    marginTop: Spacing.sm,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  retryButtonText: {
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
  },
});
