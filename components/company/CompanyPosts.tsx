import React from "react";
import { View, Animated } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import ContentCard from "@/components/content/ContentCard";
import { useCompanyPosts } from "@/hooks/posts";
import { useInteractions } from "@/hooks/posts/useInteractions";
import { useThemeColor } from "@/hooks/ui/useThemeColor";

interface CompanyPostsProps {
  companyId: string;
  posts?: any[];
}

const PostSkeleton: React.FC = () => {
  const backgroundColor = useThemeColor({}, "background");
  const borderColor = useThemeColor({}, "border");
  const [fadeAnim] = React.useState(new Animated.Value(0.3));

  React.useEffect(() => {
    const fadeInOut = () => {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.7,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => fadeInOut());
    };
    fadeInOut();
    return () => fadeAnim.stopAnimation();
  }, [fadeAnim]);

  return (
    <ThemedView
      style={[
        styles.skeletonCard,
        { borderColor: borderColor, backgroundColor: backgroundColor },
      ]}
    >
      <Animated.View
        style={[
          { height: 20, borderRadius: 4, width: "60%" },
          { opacity: fadeAnim, backgroundColor: borderColor },
        ]}
      />
      <Animated.View
        style={[
          { height: 24, borderRadius: 4, width: "80%" },
          { opacity: fadeAnim, backgroundColor: borderColor },
        ]}
      />
      <Animated.View
        style={[
          { height: 16, borderRadius: 4, width: "100%" },
          { opacity: fadeAnim, backgroundColor: borderColor },
        ]}
      />
      <Animated.View
        style={[
          { height: 16, borderRadius: 4, width: "40%" },
          { opacity: fadeAnim, backgroundColor: borderColor },
        ]}
      />
    </ThemedView>
  );
};

const LoadingSkeleton: React.FC = () => {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.postsContainer}>
        {[1, 2, 3].map((index) => (
          <PostSkeleton key={index} />
        ))}
      </View>
    </ThemedView>
  );
};

export const CompanyPosts: React.FC<CompanyPostsProps> = ({
  companyId,
  posts: providedPosts,
}) => {
  const { posts: fetchedPosts, loading, error } = useCompanyPosts(companyId);

  // Use provided posts if available, otherwise use fetched posts
  const posts = providedPosts || fetchedPosts;
  const { initializePosts } = useInteractions();

  // Filter for posts that are either:
  // 1. Job posts (company posts)
  // 2. News posts created by the company
  const companyPosts =
    posts?.filter((post) => {
      // Show job posts (company posts)
      if (post.type === "job") return true;
      // Show news posts created by the company
      if (post.type === "news") return true;
      return false;
    }) || [];

  React.useEffect(() => {
    const ids = companyPosts.map((p) => p.id as string).filter(Boolean);
    if (ids.length) initializePosts(ids);
  }, [companyPosts, initializePosts]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.emptyState}>
          <ThemedText style={styles.emptyStateText}>
            Error loading posts
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (companyPosts.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.emptyState}>
          <ThemedText style={styles.emptyStateText}>
            No posts yet from this company
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.postsContainer}>
        {companyPosts.map((post: any) => {
          const profile = post.profiles;
          const authorName = profile
            ? `${profile.name ?? ""}${
                profile.surname ? " " + profile.surname : ""
              }`.trim()
            : undefined;
          const authorAvatarUrl = profile?.avatar_url || undefined;

          return (
            <ContentCard
              key={post.id}
              id={post.id}
              variant={post.type === "job" ? "job" : "news"}
              title={post.title || ""}
              description={post.content || ""}
              mainImage={post.image_url || undefined}
              createdAt={post.created_at}
              criteria={post.criteria || undefined}
              user_id={post.user_id}
              authorName={authorName}
              authorAvatarUrl={authorAvatarUrl}
              compact={true}
            />
          );
        })}
      </View>
    </ThemedView>
  );
};

const styles = {
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  postsContainer: {
    gap: 12,
  },
  skeletonCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
  },
  emptyState: {
    alignItems: "center" as const,
    paddingVertical: 50,
  },
  emptyStateText: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: "center" as const,
  },
};
