import { useState, useCallback } from 'react';
import { supabase } from '@/utils/supabase';
import { supabaseRequest } from '@/utils/supabaseRequest';
import { useAuth } from '../auth/useAuth';

export function useCommentLikes() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if a comment is liked by the current user
  const isLiked = useCallback(async (commentId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data } = await supabaseRequest<any>(
        async () => {
          const { data, error, status } = await supabase
            .from('comment_likes')
            .select('id')
            .eq('comment_id', commentId)
            .eq('user_id', user.id)
            .single();
          return { data, error, status };
        },
        { logTag: 'comment_likes:isLiked' }
      );

      return !!data;
    } catch (err) {
      return false;
    }
  }, [user]);

  // Get the like count for a comment
  const getCommentLikeCount = useCallback(async (commentId: string): Promise<number> => {
    try {
      const { count, error } = await supabase
        .from('comment_likes')
        .select('id', { count: 'exact', head: true })
        .eq('comment_id', commentId);

      if (error) {
        return 0;
      }

      return count || 0;
    } catch (err) {
      return 0;
    }
  }, []);

  // Like a comment
  const likeComment = useCallback(async (commentId: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'Authentication required' };
    }

    try {
      setLoading(true);
      setError(null);

      // Check if already liked
      const alreadyLiked = await isLiked(commentId);
      if (alreadyLiked) {
        setLoading(false);
        return { success: true };
      }

      // Add like
      await supabaseRequest<void>(
        async () => {
          const { error, status } = await supabase
            .from('comment_likes')
            .insert({
              comment_id: commentId,
              user_id: user.id,
            });
          return { data: null, error, status };
        },
        { logTag: 'comment_likes:like' }
      );

      setLoading(false);
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to like comment';
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  }, [user, isLiked]);

  // Unlike a comment
  const unlikeComment = useCallback(async (commentId: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'Authentication required' };
    }

    try {
      setLoading(true);
      setError(null);

      // Check if liked first
      const liked = await isLiked(commentId);
      if (!liked) {
        setLoading(false);
        return { success: true };
      }

      // Remove like
      await supabaseRequest<void>(
        async () => {
          const { error, status } = await supabase
            .from('comment_likes')
            .delete()
            .eq('comment_id', commentId)
            .eq('user_id', user.id);
          return { data: null, error, status };
        },
        { logTag: 'comment_likes:unlike' }
      );

      setLoading(false);
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to unlike comment';
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  }, [user, isLiked]);

  // Toggle comment like
  const toggleCommentLike = useCallback(async (commentId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const liked = await isLiked(commentId);
      if (liked) {
        return unlikeComment(commentId);
      } else {
        return likeComment(commentId);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to toggle comment like';
      return { success: false, error: errorMessage };
    }
  }, [isLiked, likeComment, unlikeComment]);

  return {
    loading,
    error,
    isLiked,
    likeComment,
    unlikeComment,
    toggleCommentLike,
    getCommentLikeCount
  };
}
