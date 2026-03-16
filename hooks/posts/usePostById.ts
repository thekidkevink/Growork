import { supabase } from '@/utils/supabase';
import { supabaseRequest } from '@/utils/supabaseRequest';
import { useCallback, useState } from 'react';

export function usePostById() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPostById = useCallback(async (postId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch the post by ID
      const { data: post } = await supabaseRequest<any>(
        async () => {
          const { data, error, status } = await supabase
            .from('posts')
            .select('*')
            .eq('id', postId)
            .single();
          return { data, error, status };
        },
        { logTag: 'posts:getById' }
      );

      if (!post) {
        throw new Error('Post not found');
      }

      // Fetch the user profile for this post
      const { data: profile } = await supabaseRequest<any>(
        async () => {
          const { data, error, status } = await supabase
            .from('legacy_public_profiles')
            .select('*')
            .eq('id', post.user_id)
            .maybeSingle();
          return { data, error, status };
        },
        { logTag: 'profiles:getForPostById' }
      );

      // Return post with profile data
      const criteria = {
        ...(post.criteria || {}),
        company:
          post?.criteria?.company || post.company_name || undefined,
        companyId:
          post?.criteria?.companyId || post?.criteria?.company_id || undefined,
        companyLogo:
          post?.criteria?.companyLogo || post.company_logo || undefined,
      };

      return {
        data: {
          ...post,
          criteria,
          profiles: profile || null,
          company_name: post.company_name || (profile ? `${profile.name || ''} ${profile.surname || ''}`.trim() : 'Anonymous'),
          company_image: post.company_logo || profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.company_name || 'Company')}&size=128`
        },
        error: null
      };
    } catch (err: any) {
      console.error('Error fetching post by ID:', err);
      setError(err.message);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getPostById,
  };
}
