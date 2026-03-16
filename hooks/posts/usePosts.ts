import { Post, Comment, Like, PostType } from '@/types';
import { Profile } from '@/types/profile';
import { useCallback, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { supabaseRequest } from '@/utils/supabaseRequest';
import { useDataFetching } from '../data/useDataFetching';
import { usePostOperations } from './usePostOperations';

// Extended Post type with profile data
export type PostWithProfile = Post & {
  profiles?: Profile | null;
  likes?: Like[];
  comments?: Comment[];
};

// Base post fetching configuration
export interface PostFetchConfig {
  type?: PostType;
  industryFilter?: string;
  userId?: string;
  limit?: number;
  pollingInterval?: number;
  autoFetch?: boolean;
  refreshOnMount?: boolean;
}

// Base hook for all post operations
export function usePosts(config: PostFetchConfig = {}) {
  const { fetchPostsWithData } = usePostOperations();

  const fetchPosts = useCallback(async (): Promise<PostWithProfile[]> => {
    try {
      const postsData = await fetchPostsWithData({
        type: config.type,
        industry: config.industryFilter,
        userId: config.userId,
        limit: config.limit
      });

      // Transform to PostWithProfile format
      const postsWithProfiles: PostWithProfile[] = postsData.map(post => ({
        ...post,
        profiles: post.profiles || null,
        likes: post.likes || [],
        comments: post.comments || []
      }));

      return postsWithProfiles;
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  }, [fetchPostsWithData, config.type, config.industryFilter, config.userId, config.limit]);

  const {
    data: posts,
    loading,
    error,
    refreshing,
    refresh,
    clearError
  } = useDataFetching(fetchPosts, {
    autoFetch: config.autoFetch ?? true,
    refreshOnMount: config.refreshOnMount ?? true,
    pollingInterval: config.pollingInterval
  });

  return {
    posts,
    loading,
    error,
    refreshing,
    refresh,
    clearError
  };
}

// Specialized variants for specific use cases
export function useHomePosts() {
  return usePosts({
    autoFetch: true,
    refreshOnMount: true
  });
}

export function useFeedPosts(pollingInterval = 30000) {
  return usePosts({
    pollingInterval,
    autoFetch: true,
    refreshOnMount: true
  });
}

export function useMyPosts(userId: string) {
  return usePosts({
    userId,
    autoFetch: true,
    refreshOnMount: true
  });
}

export function usePostsByType(type: PostType, industryFilter?: string) {
  return usePosts({
    type,
    industryFilter,
    autoFetch: true,
    refreshOnMount: true
  });
}

// Search functionality
export function useSearchPosts() {
  const [searchResults, setSearchResults] = useState<PostWithProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchPosts = useCallback(async (searchTerm: string, type?: PostType, industryFilter?: string) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Build the search query
      let query = supabase
        .from('posts')
        .select('*')
        .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%,criteria->>company.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (type) {
        query = query.eq('type', type);
      }

      if (industryFilter) {
        query = query.eq('industry', industryFilter);
      }

      const { data: postsData } = await supabaseRequest<any[]>(
        async () => {
          const { data, error, status } = await query;
          return { data, error, status };
        },
        { logTag: 'posts:search' }
      );

      // Batch-fetch profiles for all posts in a single request
      const userIds = Array.from(new Set((postsData || []).map((p: any) => p.user_id).filter(Boolean)));
      let profilesById: Record<string, any> = {};
      if (userIds.length) {
        const { data: profilesData } = await supabaseRequest<any[]>(
          async () => {
            const { data, error, status } = await supabase
              .from('legacy_public_profiles')
              .select('*')
              .in('id', userIds);
            return { data, error, status };
          },
          { logTag: 'profiles:listForSearch' }
        );
        for (const p of profilesData || []) {
          if (p?.id) profilesById[p.id] = p;
        }
      }

      const postsWithProfiles = (postsData || []).map((post: any) => ({
        ...post,
        profiles: profilesById[post.user_id] || null,
        likes: [],
        comments: []
      }));

      setSearchResults(postsWithProfiles);
    } catch (err: any) {
      console.error('Error searching posts:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    searchResults,
    loading,
    error,
    searchPosts
  };
}
