import { buildHomeFeedCards, buildHomeFeedPage, type HomeFeedCard } from '@/src/features/feed/services/homeFeedAdapter';
import { buildHomeFeedQuery, createEmptyFeedPage } from '@/src/features/feed/services/homeFeedPlanner';
import type { FeedFilter, FeedPage } from '@/src/features/feed/domain/feed';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { type ExtendedContentCardProps, usePostOperations } from './usePostOperations';

interface UseHomeFeedOptions {
  filter?: FeedFilter;
  industry?: string | null;
}

export function useHomeFeed(options: UseHomeFeedOptions = {}) {
  const [posts, setPosts] = useState<HomeFeedCard[]>([]);
  const [page, setPage] = useState<FeedPage>(createEmptyFeedPage());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { fetchPostsWithData, convertDbPostsToContentCards } = usePostOperations();
  const query = useMemo(
    () =>
      buildHomeFeedQuery({
        filter: options.filter,
        industry: options.industry,
      }),
    [options.filter, options.industry]
  );

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const postsData = await fetchPostsWithData();

      const successfulPosts = await convertDbPostsToContentCards(postsData);

      const nextPage = buildHomeFeedPage(successfulPosts, query);
      const nextCards = buildHomeFeedCards(successfulPosts, query);

      setPage(nextPage);
      setPosts(nextCards);
    } catch (err: any) {
      console.error('Error fetching posts for home feed:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchPostsWithData, convertDbPostsToContentCards, query]);

  const refresh = useCallback(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return {
    posts,
    page,
    query,
    loading,
    error,
    refresh,
  };
}
