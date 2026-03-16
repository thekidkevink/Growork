import React from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Post } from "@/types/posts";
import { Profile } from "@/types/profile";
import { Feather } from "@expo/vector-icons";
import { PostType } from "@/types";
import ScreenContainer from "@/components/ScreenContainer";
import { useBottomSheetManager } from "@/components/content/BottomSheetManager";
import { SearchResultsSkeleton } from "@/components/ui/Skeleton";
import ContentCard from "@/components/content/ContentCard";
import { useInteractions } from "@/hooks/posts/useInteractions";
import { useAuth } from "@/hooks";

interface PostWithProfile extends Post {
  profiles?: Profile | null;
}

interface SearchResultsProps {
  results: (PostWithProfile & { _type: "post" })[];
  loading: boolean;
}

export default function SearchResults({
  results,
  loading,
}: SearchResultsProps) {
  const { initializePosts } = useInteractions();
  if (loading) {
    return <SearchResultsSkeleton />;
  }

  if (results.length === 0) {
    return (
      <View style={styles.centered}>
        <View style={styles.iconCircle}>
          <Feather name="search" size={32} color="#9ca3af" />
        </View>
        <Text style={styles.noResultsTitle}>No results found</Text>
        <Text style={styles.noResultsSub}>
          Try adjusting your search terms or filters to find what you are
          looking for
        </Text>
      </View>
    );
  }

  React.useEffect(() => {
    const ids = results.map((p) => p.id as string).filter(Boolean);
    if (ids.length) initializePosts(ids);
  }, [results, initializePosts]);

  return (
    <ScreenContainer>
      {results.length > 0 && (
        <FlatList
          removeClippedSubviews={false}
          data={results}
          keyExtractor={(item, index) => `post-${item.id || index}`}
          renderItem={({ item }) => (
            <View style={styles.itemContainer}>
              <PostResultItem post={item} />
            </View>
          )}
        />
      )}
    </ScreenContainer>
  );
}

function PostResultItem({ post }: { post: PostWithProfile }) {
  const { user } = useAuth();
  const { openJobApplicationSheet } = useBottomSheetManager();
  const cardVariant = post.type === PostType.Job ? "job" : "news";

  // Use description/content if available
  const description = post.content || "";

  // Validate and get main image
  const getMainImage = () => {
    if (!post.image_url || post.image_url.trim() === "") {
      return undefined;
    }

    // Basic URL validation
    try {
      new URL(post.image_url);
      return post.image_url;
    } catch {
      return undefined;
    }
  };

  const mainImage = getMainImage();

  // Author props from profile
  const authorName = post.profiles
    ? `${post.profiles.name ?? ""}${
        post.profiles.surname ? " " + post.profiles.surname : ""
      }`.trim()
    : undefined;
  const authorAvatarUrl = post.profiles?.avatar_url || undefined;

  const handleApplyToJob = () => {
    if (post.type === PostType.Job) {
      openJobApplicationSheet(post, {
        onSuccess: () => {},
      });
    }
  };

  return (
    <ContentCard
      variant={cardVariant}
      id={post.id}
      title={post.title || ""}
      description={description}
      mainImage={mainImage}
      createdAt={post.created_at}
      criteria={post.criteria || undefined}
      onPressApply={handleApplyToJob}
      user_id={post.user_id}
      isOwnedByCurrentUser={
        post.type === PostType.Job && !!user?.id && post.user_id === user.id
      }
      ownerBadgeLabel="Your listing"
      ownerActionLabel="Manage"
      authorName={authorName}
      authorAvatarUrl={authorAvatarUrl}
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    textAlign: "center",
  },
  iconCircle: {
    backgroundColor: "#f3f4f6",
    padding: 16,
    borderRadius: 50,
    marginBottom: 16,
  },
  noResultsTitle: {
    color: "#4b5563",
    fontSize: 18,
    fontWeight: "500",
  },
  noResultsSub: {
    color: "#9ca3af",
    fontSize: 14,
    marginTop: 8,
    maxWidth: 300,
    textAlign: "center",
  },
  itemContainer: {
    padding: 16,
    borderBottomColor: "#e5e7eb",
    borderBottomWidth: 1,
  },
  sectionHeader: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f9fafb",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
  },
});
